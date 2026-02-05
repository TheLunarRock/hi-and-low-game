'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

/** シークレットジェスチャーの設定 */
const SECRET_CONFIG = {
  /** 長押し時間（ミリ秒） */
  LONG_PRESS_DURATION: 3000,
  /** 長押し後のタップ受付時間（ミリ秒） */
  TAP_WINDOW: 2000,
  /** タップ完了までの制限時間（ミリ秒） */
  TAP_TIMEOUT: 1000,
  /** 必要なタップ回数 */
  REQUIRED_TAPS: 3,
  /** 遷移先 */
  DESTINATION: '/m',
} as const

interface SecretGestureState {
  /** シークレットジェスチャーのアクティベーション状態（ランキング色変化用） */
  isActivated: boolean
  /** 長押し開始ハンドラー */
  onPressStart: () => void
  /** 長押し終了ハンドラー */
  onPressEnd: () => void
  /** タップハンドラー */
  onTap: () => void
}

/**
 * シークレットジェスチャーフック
 *
 * 1. 3秒長押し → isActivated = true（ランキング色変化）
 * 2. 2秒以内に、1秒以内で3回タップ → /m に遷移
 *
 * 秘匿性要件:
 * - ポインタースタイル変更なし（呼び出し側で対応）
 * - 長押し中の視覚変化なし
 * - エラー時は静かにリセット
 */
export function useSecretGesture(): SecretGestureState {
  const router = useRouter()

  // 状態管理
  const [isActivated, setIsActivated] = useState(false)

  // クロージャー問題回避：isActivatedの最新値をRefで追跡
  const isActivatedRef = useRef(false)
  isActivatedRef.current = isActivated

  // マウント状態追跡（メモリリーク防止）
  const isMountedRef = useRef(true)

  // タイマーRef
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tapWindowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tapTimeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // タップカウント
  const tapCountRef = useRef(0)
  const firstTapTimeRef = useRef<number | null>(null)

  /**
   * 全タイマーをクリア
   */
  const clearAllTimers = useCallback(() => {
    if (longPressTimerRef.current !== null) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    if (tapWindowTimerRef.current !== null) {
      clearTimeout(tapWindowTimerRef.current)
      tapWindowTimerRef.current = null
    }
    if (tapTimeoutTimerRef.current !== null) {
      clearTimeout(tapTimeoutTimerRef.current)
      tapTimeoutTimerRef.current = null
    }
  }, [])

  /**
   * 静かにリセット（エラー時）
   */
  const silentReset = useCallback(() => {
    clearAllTimers()
    if (isMountedRef.current) {
      setIsActivated(false)
    }
    tapCountRef.current = 0
    firstTapTimeRef.current = null
  }, [clearAllTimers])

  // クリーンアップ：アンマウント時にタイマーをクリア
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      clearAllTimers()
    }
  }, [clearAllTimers])

  /**
   * 長押し開始
   */
  const onPressStart = useCallback(() => {
    // 既にアクティベート済みの場合は何もしない（タップ待機中）
    if (isActivatedRef.current) return

    // 前のタイマーをクリア（重複防止）
    if (longPressTimerRef.current !== null) {
      clearTimeout(longPressTimerRef.current)
    }

    // 長押しタイマー開始
    longPressTimerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return

      setIsActivated(true)

      // タップ受付ウィンドウ開始（2秒）
      tapWindowTimerRef.current = setTimeout(() => {
        // 時間切れ → 静かにリセット
        silentReset()
      }, SECRET_CONFIG.TAP_WINDOW)
    }, SECRET_CONFIG.LONG_PRESS_DURATION)
  }, [silentReset])

  /**
   * 長押し終了
   */
  const onPressEnd = useCallback(() => {
    // アクティベート前に離した場合 → キャンセル
    if (!isActivatedRef.current && longPressTimerRef.current !== null) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  /**
   * タップ処理
   */
  const onTap = useCallback(() => {
    // アクティベート状態でない場合は何もしない
    if (!isActivatedRef.current) return

    const now = Date.now()

    // 最初のタップ
    if (tapCountRef.current === 0) {
      firstTapTimeRef.current = now
      tapCountRef.current = 1

      // タップ完了タイムアウト開始（1秒）
      tapTimeoutTimerRef.current = setTimeout(() => {
        // 1秒以内に3回タップできなかった → 静かにリセット
        silentReset()
      }, SECRET_CONFIG.TAP_TIMEOUT)

      return
    }

    // 2回目以降のタップ
    const elapsed = now - (firstTapTimeRef.current ?? now)

    // 1秒以内かチェック
    if (elapsed > SECRET_CONFIG.TAP_TIMEOUT) {
      // 時間オーバー → 静かにリセット
      silentReset()
      return
    }

    tapCountRef.current += 1

    // 3回タップ完了
    if (tapCountRef.current >= SECRET_CONFIG.REQUIRED_TAPS) {
      clearAllTimers()
      // 遷移
      router.push(SECRET_CONFIG.DESTINATION)
    }
  }, [silentReset, clearAllTimers, router])

  return {
    isActivated,
    onPressStart,
    onPressEnd,
    onTap,
  }
}
