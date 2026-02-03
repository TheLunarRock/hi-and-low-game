'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { STORAGE_KEY, SUITS } from '../constants'
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
  const [isRevealing, setIsRevealing] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // クライアント側でのみ初期化（Hydration mismatch回避）
  useEffect(() => {
    setCurrentCard(generateRandomCard())
    setHighScore(getStoredHighScore())
    setIsInitialized(true)
  }, [])

  /**
   * 予想を行う
   */
  const makeGuess = useCallback(
    (guess: Guess): void => {
      // 初期化前またはゲーム中でない場合は何もしない
      if (currentCard === null || gameState !== 'playing' || isRevealing) return

      const newCard = generateRandomCard()
      setNextCard(newCard)
      setIsRevealing(true)

      // 結果判定を遅延させてアニメーション効果
      setTimeout(() => {
        const isCorrect =
          (guess === 'high' && newCard.value >= currentCard.value) ||
          (guess === 'low' && newCard.value <= currentCard.value)

        if (isCorrect) {
          const newStreak = streak + 1
          setStreak(newStreak)
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
          setGameState('lost')
          setIsRevealing(false)
        }
      }, 500)
    },
    [currentCard, gameState, highScore, isRevealing, streak]
  )

  /**
   * ゲームをリセット
   */
  const resetGame = useCallback((): void => {
    setCurrentCard(generateRandomCard())
    setNextCard(null)
    setGameState('playing')
    setStreak(0)
    setIsRevealing(false)
  }, [])

  return useMemo(
    () => ({
      currentCard,
      nextCard,
      gameState,
      streak,
      highScore,
      isRevealing,
      isInitialized,
      makeGuess,
      resetGame,
    }),
    [
      currentCard,
      nextCard,
      gameState,
      streak,
      highScore,
      isRevealing,
      isInitialized,
      makeGuess,
      resetGame,
    ]
  )
}
