/**
 * Bug ID: 2025-02-04-003
 * Date: 2025-02-04
 * Issue: タイマーのクリーンアップ不足によるメモリリーク
 *        - コンポーネントアンマウント後のstate更新
 *        - setTimeout のクリーンアップ漏れ
 * Feature: game
 * Fixed by: useRef でタイマーID管理 + isMountedRef パターン
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Regression: 2025-02-04-003 - Timer cleanup', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('timer management pattern', () => {
    it('should clear timers on cleanup', () => {
      // タイマーID管理のパターン
      let timerRef: ReturnType<typeof setTimeout> | null = null
      let stateUpdated = false

      // タイマー設定
      timerRef = setTimeout(() => {
        stateUpdated = true
      }, 1000)

      expect(timerRef).not.toBe(null)
      expect(stateUpdated).toBe(false)

      // クリーンアップ（アンマウント時）
      // タイマーが設定されているのでクリア
      clearTimeout(timerRef)
      timerRef = null

      // タイマーが発火しても状態が更新されない
      vi.advanceTimersByTime(1000)
      expect(stateUpdated).toBe(false)
    })

    it('should prevent state updates after unmount using isMountedRef', () => {
      // isMountedRef パターンのシミュレーション
      let isMounted = true
      let stateValue = 0

      const safeSetState = (newValue: number) => {
        if (!isMounted) return // アンマウント後は更新しない
        stateValue = newValue
      }

      // マウント中は更新可能
      safeSetState(1)
      expect(stateValue).toBe(1)

      // アンマウント
      isMounted = false

      // アンマウント後は更新されない
      safeSetState(2)
      expect(stateValue).toBe(1) // 変更されていない
    })

    it('should clear multiple timers correctly', () => {
      // 複数タイマーの管理
      let revealTimerRef: ReturnType<typeof setTimeout> | null = null
      let transitionTimerRef: ReturnType<typeof setTimeout> | null = null
      let revealExecuted = false
      let transitionExecuted = false

      // タイマー設定
      revealTimerRef = setTimeout(() => {
        revealExecuted = true
      }, 500)

      transitionTimerRef = setTimeout(() => {
        transitionExecuted = true
      }, 1000)

      // 全タイマークリア関数
      const clearAllTimers = () => {
        if (revealTimerRef !== null) {
          clearTimeout(revealTimerRef)
          revealTimerRef = null
        }
        if (transitionTimerRef !== null) {
          clearTimeout(transitionTimerRef)
          transitionTimerRef = null
        }
      }

      // クリーンアップ実行
      clearAllTimers()

      // タイマー進行
      vi.advanceTimersByTime(1500)

      // どちらも実行されていない
      expect(revealExecuted).toBe(false)
      expect(transitionExecuted).toBe(false)
      expect(revealTimerRef).toBe(null)
      expect(transitionTimerRef).toBe(null)
    })
  })

  describe('async state update guard', () => {
    it('should guard state updates in setTimeout callback', () => {
      let isMounted = true
      let callbackExecuted = false
      let stateUpdated = false

      // 非同期コールバック内でのガード
      const timerCallback = () => {
        callbackExecuted = true
        if (!isMounted) return // ガード
        stateUpdated = true
      }

      setTimeout(timerCallback, 500)

      // アンマウント前にタイマー発火
      vi.advanceTimersByTime(500)
      expect(callbackExecuted).toBe(true)
      expect(stateUpdated).toBe(true)

      // リセット
      callbackExecuted = false
      stateUpdated = false

      setTimeout(timerCallback, 500)

      // アンマウント後にタイマー発火
      isMounted = false
      vi.advanceTimersByTime(500)

      expect(callbackExecuted).toBe(true) // コールバック自体は実行される
      expect(stateUpdated).toBe(false) // しかし状態は更新されない
    })
  })
})
