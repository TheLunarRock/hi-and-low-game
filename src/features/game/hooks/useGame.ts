'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { ANIMATION_DELAY, INITIAL_COINS, STORAGE_KEY, SUITS } from '../constants'
import type { Card, CardValue, GameState, Guess, Suit } from '../types'

// ============================================
// ユーティリティ関数
// ============================================

/**
 * ランダムなカードを生成
 * Note: ゲーム用途のため、暗号学的な安全性は不要
 */
function generateRandomCard(): Card {
  // eslint-disable-next-line sonarjs/pseudo-random -- ゲーム用途のため許容
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)] as Suit
  // eslint-disable-next-line sonarjs/pseudo-random -- ゲーム用途のため許容
  const value = (Math.floor(Math.random() * 13) + 1) as CardValue
  return { suit, value }
}

/**
 * 安全なlocalStorage操作（エラーハンドリング付き）
 * プライベートブラウジングやQuota超過時の例外を処理
 */
const safeStorage = {
  get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue
    try {
      const stored = localStorage.getItem(key)
      if (stored === null) return defaultValue
      const parsed = JSON.parse(stored) as unknown
      return typeof parsed === typeof defaultValue ? (parsed as T) : defaultValue
    } catch {
      // localStorage無効時やパースエラー時はデフォルト値を返す
      return defaultValue
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Quota超過時等は静かに失敗（ゲームの続行を優先）
    }
  },
}

// ============================================
// カスタムフック
// ============================================

/**
 * ゲームロジックフック
 * @internal このフックは内部使用のみ
 */
export function useGame() {
  // SSR時は固定値、クライアントでuseEffectで初期化
  const [currentCard, setCurrentCard] = useState<Card | null>(null)
  const [nextCard, setNextCard] = useState<Card | null>(null)
  const [gameState, setGameState] = useState<GameState>('playing')
  const [streak, setStreak] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [coins, setCoins] = useState(INITIAL_COINS)
  const [isRevealing, setIsRevealing] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // タイマーIDを保持（クリーンアップ用）
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // マウント状態を追跡（アンマウント後のstate更新を防止）
  const isMountedRef = useRef(true)

  /**
   * 全タイマーをクリア
   */
  const clearAllTimers = useCallback(() => {
    if (revealTimerRef.current !== null) {
      clearTimeout(revealTimerRef.current)
      revealTimerRef.current = null
    }
    if (transitionTimerRef.current !== null) {
      clearTimeout(transitionTimerRef.current)
      transitionTimerRef.current = null
    }
  }, [])

  /**
   * 次のラウンドへ遷移（共通処理をDRY化）
   */
  const transitionToNextRound = useCallback((newCard: Card) => {
    transitionTimerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return
      setCurrentCard(newCard)
      setNextCard(null)
      setGameState('playing')
      setIsRevealing(false)
    }, ANIMATION_DELAY.NEXT_ROUND)
  }, [])

  /**
   * ゲーム状態を初期化（共通処理をDRY化）
   */
  const initializeGameState = useCallback(() => {
    clearAllTimers()
    setCurrentCard(generateRandomCard())
    setNextCard(null)
    setGameState('playing')
    setStreak(0)
    setIsRevealing(false)
  }, [clearAllTimers])

  // クライアント側でのみ初期化（Hydration mismatch回避）
  useEffect(() => {
    isMountedRef.current = true
    setCurrentCard(generateRandomCard())
    setHighScore(safeStorage.get(STORAGE_KEY.HIGH_SCORE, 0))
    setCoins(safeStorage.get(STORAGE_KEY.COINS, INITIAL_COINS))
    setIsInitialized(true)

    // クリーンアップ: コンポーネントアンマウント時
    return () => {
      isMountedRef.current = false
      clearAllTimers()
    }
  }, [clearAllTimers])

  /**
   * 予想を行う
   */
  const makeGuess = useCallback(
    (guess: Guess): void => {
      // ガード条件: 初期化前、ゲーム中でない、判定中、コイン不足
      if (currentCard === null || gameState !== 'playing' || isRevealing || coins <= 0) return

      // 1コイン消費
      const newCoins = coins - 1
      setCoins(newCoins)

      const newCard = generateRandomCard()
      setNextCard(newCard)
      setIsRevealing(true)

      // 結果判定を遅延させてアニメーション効果
      revealTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return

        const isDraw = newCard.value === currentCard.value
        const isWin =
          (guess === 'high' && newCard.value > currentCard.value) ||
          (guess === 'low' && newCard.value < currentCard.value)

        if (isDraw) {
          // ドロー：コインを返却
          const refundedCoins = newCoins + 1
          setCoins(refundedCoins)
          safeStorage.set(STORAGE_KEY.COINS, refundedCoins)
          setGameState('draw')
          transitionToNextRound(newCard)
        } else if (isWin) {
          // 勝利：連勝数分のコインを獲得
          const newStreak = streak + 1
          const wonCoins = newCoins + newStreak
          setStreak(newStreak)
          setCoins(wonCoins)
          safeStorage.set(STORAGE_KEY.COINS, wonCoins)
          setGameState('won')

          // ハイスコア更新
          if (newStreak > highScore) {
            setHighScore(newStreak)
            safeStorage.set(STORAGE_KEY.HIGH_SCORE, newStreak)
          }

          transitionToNextRound(newCard)
        } else {
          // 敗北：連勝リセット、コインは既に消費済み
          safeStorage.set(STORAGE_KEY.COINS, newCoins)
          setStreak(0)
          setGameState(newCoins <= 0 ? 'gameover' : 'lost')
          setIsRevealing(false)
        }
      }, ANIMATION_DELAY.REVEAL)
    },
    [coins, currentCard, gameState, highScore, isRevealing, streak, transitionToNextRound]
  )

  /**
   * ゲームをリセット（敗北後に続ける）
   */
  const resetGame = useCallback((): void => {
    initializeGameState()
  }, [initializeGameState])

  /**
   * ゲームを完全にリセット（コインも初期化）
   */
  const fullReset = useCallback((): void => {
    initializeGameState()
    setCoins(INITIAL_COINS)
    safeStorage.set(STORAGE_KEY.COINS, INITIAL_COINS)
  }, [initializeGameState])

  return useMemo(
    () => ({
      currentCard,
      nextCard,
      gameState,
      streak,
      highScore,
      coins,
      isRevealing,
      isInitialized,
      makeGuess,
      resetGame,
      fullReset,
    }),
    [
      currentCard,
      nextCard,
      gameState,
      streak,
      highScore,
      coins,
      isRevealing,
      isInitialized,
      makeGuess,
      resetGame,
      fullReset,
    ]
  )
}
