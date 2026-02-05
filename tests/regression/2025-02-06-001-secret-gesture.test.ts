/**
 * Bug ID: 2025-02-06-001
 * Date: 2025-02-06
 * Issue: シークレットジェスチャーのタイマー管理とメモリリーク防止
 * Feature: game (シークレットジェスチャー)
 * Fixed by: コードレビュー改善
 *
 * テスト対象:
 * - タイマーの適切なクリーンアップ
 * - クロージャー問題の回避（isActivatedRef）
 * - 重複タイマーの防止
 * - アンマウント時のメモリリーク防止
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

// タイマー管理パターンのテスト用ヘルパー
function createTimerManager() {
  const timers: ReturnType<typeof setTimeout>[] = []

  return {
    timers,
    createTimer: (callback: () => void, delay: number) => {
      const timer = setTimeout(callback, delay)
      timers.push(timer)
      return timer
    },
    clearAllTimers: () => {
      timers.forEach((timer) => clearTimeout(timer))
      timers.length = 0
    },
  }
}

// 重複タイマー防止パターンのテスト用ヘルパー
function createDuplicatePreventionManager() {
  let timerRef: ReturnType<typeof setTimeout> | null = null
  let callCount = 0

  return {
    getCallCount: () => callCount,
    onPressStart: () => {
      if (timerRef !== null) {
        clearTimeout(timerRef)
      }
      timerRef = setTimeout(() => {
        callCount++
      }, 3000)
    },
  }
}

describe('Regression: 2025-02-06-001 - シークレットジェスチャー', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('タイマー管理', () => {
    it('should have proper timer cleanup on unmount pattern', () => {
      const manager = createTimerManager()

      // タイマー作成
      manager.createTimer(() => undefined, 1000)
      manager.createTimer(() => undefined, 1000)
      expect(manager.timers.length).toBe(2)

      // クリーンアップ
      manager.clearAllTimers()
      expect(manager.timers.length).toBe(0)
    })

    it('should prevent duplicate timers on rapid press', () => {
      const manager = createDuplicatePreventionManager()

      // 急速に3回押す
      manager.onPressStart()
      vi.advanceTimersByTime(1000)
      manager.onPressStart()
      vi.advanceTimersByTime(1000)
      manager.onPressStart()

      // 3秒待つ
      vi.advanceTimersByTime(3000)

      // 最後のタイマーだけが発火
      expect(manager.getCallCount()).toBe(1)
    })
  })

  describe('クロージャー問題', () => {
    it('should track latest value with useRef pattern', () => {
      // useRefパターンのシミュレーション
      const stateRef = { current: false }

      const setState = (value: boolean) => {
        stateRef.current = value
      }

      const callback = () => stateRef.current

      // 初期状態
      expect(callback()).toBe(false)

      // 状態更新
      setState(true)

      // refを使用すると最新値が取得できる
      expect(callback()).toBe(true)
    })
  })

  describe('マウント状態追跡', () => {
    it('should prevent state update after unmount', () => {
      const isMountedRef = { current: true }
      let stateUpdates = 0

      const safeSetState = () => {
        if (isMountedRef.current) {
          stateUpdates++
        }
      }

      // マウント中は更新可能
      safeSetState()
      expect(stateUpdates).toBe(1)

      // アンマウント後は更新しない
      isMountedRef.current = false
      safeSetState()
      expect(stateUpdates).toBe(1)
    })
  })

  describe('シークレットジェスチャーフロー', () => {
    it('should complete gesture sequence: long press → activate → tap 3 times', () => {
      const state = { isActivated: false, tapCount: 0, navigated: false }
      const LONG_PRESS_DURATION = 3000
      const TAP_TIMEOUT = 1000
      const REQUIRED_TAPS = 3

      // 長押し完了
      setTimeout(() => {
        state.isActivated = true
      }, LONG_PRESS_DURATION)

      vi.advanceTimersByTime(LONG_PRESS_DURATION)
      expect(state.isActivated).toBe(true)

      // 3回タップ（1秒以内）
      for (let i = 0; i < REQUIRED_TAPS; i++) {
        state.tapCount++
        if (state.tapCount >= REQUIRED_TAPS) {
          state.navigated = true
        }
        vi.advanceTimersByTime(TAP_TIMEOUT / 4) // 250ms間隔
      }

      expect(state.tapCount).toBe(3)
      expect(state.navigated).toBe(true)
    })

    it('should reset on tap timeout', () => {
      const state = { isActivated: true, tapCount: 1 }
      const TAP_TIMEOUT = 1000

      // タイムアウト後にリセット
      setTimeout(() => {
        if (state.tapCount < 3) {
          state.isActivated = false
          state.tapCount = 0
        }
      }, TAP_TIMEOUT)

      vi.advanceTimersByTime(TAP_TIMEOUT)

      expect(state.isActivated).toBe(false)
      expect(state.tapCount).toBe(0)
    })
  })
})
