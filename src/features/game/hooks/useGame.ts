'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { INITIAL_COINS, STORAGE_KEY, SUITS } from '../constants'
import type { Card, CardValue, GameState, Guess, Suit } from '../types'

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
 * ローカルストレージからハイスコアを取得
 */
function getStoredHighScore(): number {
  if (typeof window === 'undefined') return 0
  const stored = localStorage.getItem(STORAGE_KEY.HIGH_SCORE)
  if (stored === null) return 0
  const parsed = parseInt(stored, 10)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * ハイスコアをローカルストレージに保存
 */
function saveHighScore(score: number): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY.HIGH_SCORE, String(score))
}

/**
 * ローカルストレージからコインを取得
 */
function getStoredCoins(): number {
  if (typeof window === 'undefined') return INITIAL_COINS
  const stored = localStorage.getItem(STORAGE_KEY.COINS)
  if (stored === null) return INITIAL_COINS
  const parsed = parseInt(stored, 10)
  return isNaN(parsed) ? INITIAL_COINS : parsed
}

/**
 * コインをローカルストレージに保存
 */
function saveCoins(coins: number): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY.COINS, String(coins))
}

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

  // クライアント側でのみ初期化（Hydration mismatch回避）
  useEffect(() => {
    setCurrentCard(generateRandomCard())
    setHighScore(getStoredHighScore())
    setCoins(getStoredCoins())
    setIsInitialized(true)
  }, [])

  /**
   * 予想を行う
   */
  const makeGuess = useCallback(
    (guess: Guess): void => {
      // 初期化前、ゲーム中でない、またはコイン不足の場合は何もしない
      if (currentCard === null || gameState !== 'playing' || isRevealing || coins <= 0) return

      // 1コイン消費
      const newCoins = coins - 1
      setCoins(newCoins)

      const newCard = generateRandomCard()
      setNextCard(newCard)
      setIsRevealing(true)

      // 結果判定を遅延させてアニメーション効果
      setTimeout(() => {
        const isDraw = newCard.value === currentCard.value
        const isWin =
          (guess === 'high' && newCard.value > currentCard.value) ||
          (guess === 'low' && newCard.value < currentCard.value)

        if (isDraw) {
          // ドロー：コインを返却
          const refundedCoins = newCoins + 1
          setCoins(refundedCoins)
          saveCoins(refundedCoins)
          setGameState('draw')

          // 次のラウンドへ自動遷移
          setTimeout(() => {
            setCurrentCard(newCard)
            setNextCard(null)
            setGameState('playing')
            setIsRevealing(false)
          }, 1000)
        } else if (isWin) {
          // 勝利：連勝数+1のコインを獲得
          const newStreak = streak + 1
          const reward = newStreak
          const wonCoins = newCoins + reward
          setStreak(newStreak)
          setCoins(wonCoins)
          saveCoins(wonCoins)
          setGameState('won')

          // ハイスコア更新
          if (newStreak > highScore) {
            setHighScore(newStreak)
            saveHighScore(newStreak)
          }

          // 次のラウンドへ自動遷移
          setTimeout(() => {
            setCurrentCard(newCard)
            setNextCard(null)
            setGameState('playing')
            setIsRevealing(false)
          }, 1000)
        } else {
          // 敗北：連勝リセット、コインは既に消費済み
          saveCoins(newCoins)
          setStreak(0)

          if (newCoins <= 0) {
            setGameState('gameover')
          } else {
            setGameState('lost')
          }
          setIsRevealing(false)
        }
      }, 500)
    },
    [coins, currentCard, gameState, highScore, isRevealing, streak]
  )

  /**
   * ゲームをリセット（敗北後に続ける）
   */
  const resetGame = useCallback((): void => {
    setCurrentCard(generateRandomCard())
    setNextCard(null)
    setGameState('playing')
    setStreak(0)
    setIsRevealing(false)
  }, [])

  /**
   * ゲームを完全にリセット（コインも初期化）
   */
  const fullReset = useCallback((): void => {
    setCurrentCard(generateRandomCard())
    setNextCard(null)
    setGameState('playing')
    setStreak(0)
    setCoins(INITIAL_COINS)
    saveCoins(INITIAL_COINS)
    setIsRevealing(false)
  }, [])

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
