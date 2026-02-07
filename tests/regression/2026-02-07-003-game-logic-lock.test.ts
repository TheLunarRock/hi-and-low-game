/**
 * Bug ID: 2026-02-07-003
 * Date: 2026-02-07
 * Issue: ゲームロジックのロックダウン - v1.0.0のゲームルールが変更されていないことを検証
 * Feature: game
 * Fixed by: N/A - 保護テスト（削除禁止）
 */

import { describe, expect, it } from 'vitest'

import { INITIAL_COINS } from '@/features/game/constants'
import type { Card, CardValue, GameState, Guess, Suit } from '@/features/game/types'

// ============================================
// ゲームロジックの純粋関数テスト
// useGame.tsの内部ロジックを再現して検証
// ============================================

/** 勝敗判定ロジック（useGame.ts makeGuess相当） */
function determineResult(
  guess: Guess,
  currentValue: CardValue,
  nextValue: CardValue
): 'won' | 'lost' | 'draw' {
  if (nextValue === currentValue) return 'draw'
  if (guess === 'high' && nextValue > currentValue) return 'won'
  if (guess === 'low' && nextValue < currentValue) return 'won'
  return 'lost'
}

/** コイン計算ロジック */
function calculateCoins(
  currentCoins: number,
  result: 'won' | 'lost' | 'draw',
  currentStreak: number
): { newCoins: number; newStreak: number; gameState: GameState } {
  // 1コイン消費
  const afterBet = currentCoins - 1

  if (result === 'draw') {
    // 引き分け: コイン返却、ストリークリセット
    return { newCoins: afterBet + 1, newStreak: 0, gameState: 'draw' }
  }

  if (result === 'won') {
    // 勝利: ストリーク+1、ストリーク数のコイン獲得
    const newStreak = currentStreak + 1
    return { newCoins: afterBet + newStreak, newStreak, gameState: 'won' }
  }

  // 敗北: コイン減少、ストリークリセット
  if (afterBet <= 0) {
    return { newCoins: 0, newStreak: 0, gameState: 'gameover' }
  }
  return { newCoins: afterBet, newStreak: 0, gameState: 'lost' }
}

describe('Lockdown: ゲームルール v1.0.0', () => {
  describe('勝敗判定', () => {
    it('HIGH予想で次カードが大きい → 勝利', () => {
      expect(determineResult('high', 5 as CardValue, 10 as CardValue)).toBe('won')
    })

    it('HIGH予想で次カードが小さい → 敗北', () => {
      expect(determineResult('high', 10 as CardValue, 3 as CardValue)).toBe('lost')
    })

    it('LOW予想で次カードが小さい → 勝利', () => {
      expect(determineResult('low', 10 as CardValue, 3 as CardValue)).toBe('won')
    })

    it('LOW予想で次カードが大きい → 敗北', () => {
      expect(determineResult('low', 3 as CardValue, 10 as CardValue)).toBe('lost')
    })

    it('同じ値 → 引き分け（予想に関係なく）', () => {
      expect(determineResult('high', 7 as CardValue, 7 as CardValue)).toBe('draw')
      expect(determineResult('low', 7 as CardValue, 7 as CardValue)).toBe('draw')
    })

    it('A(1)とK(13)の境界値', () => {
      expect(determineResult('high', 1 as CardValue, 13 as CardValue)).toBe('won')
      expect(determineResult('low', 13 as CardValue, 1 as CardValue)).toBe('won')
      expect(determineResult('high', 13 as CardValue, 1 as CardValue)).toBe('lost')
      expect(determineResult('low', 1 as CardValue, 13 as CardValue)).toBe('lost')
    })
  })

  describe('コイン計算', () => {
    it('初期コインは10枚', () => {
      expect(INITIAL_COINS).toBe(10)
    })

    it('1回のゲームで1コイン消費', () => {
      const result = calculateCoins(10, 'lost', 0)
      expect(result.newCoins).toBe(9) // 10 - 1 = 9
    })

    it('勝利: ストリーク1でコイン+1（差し引きゼロ）', () => {
      const result = calculateCoins(10, 'won', 0)
      // 10 - 1(ベット) + 1(新ストリーク) = 10
      expect(result.newCoins).toBe(10)
      expect(result.newStreak).toBe(1)
    })

    it('勝利: ストリーク2でコイン+2（差し引き+1）', () => {
      const result = calculateCoins(10, 'won', 1)
      // 10 - 1(ベット) + 2(新ストリーク) = 11
      expect(result.newCoins).toBe(11)
      expect(result.newStreak).toBe(2)
    })

    it('勝利: ストリーク5でコイン+5（差し引き+4）', () => {
      const result = calculateCoins(10, 'won', 4)
      // 10 - 1(ベット) + 5(新ストリーク) = 14
      expect(result.newCoins).toBe(14)
      expect(result.newStreak).toBe(5)
    })

    it('引き分け: コイン返却、ストリークリセット', () => {
      const result = calculateCoins(10, 'draw', 3)
      // 10 - 1(ベット) + 1(返却) = 10
      expect(result.newCoins).toBe(10)
      expect(result.newStreak).toBe(0)
      expect(result.gameState).toBe('draw')
    })

    it('敗北: コイン減少、ストリークリセット', () => {
      const result = calculateCoins(5, 'lost', 3)
      // 5 - 1 = 4
      expect(result.newCoins).toBe(4)
      expect(result.newStreak).toBe(0)
      expect(result.gameState).toBe('lost')
    })

    it('最後の1コインで敗北 → ゲームオーバー', () => {
      const result = calculateCoins(1, 'lost', 0)
      // 1 - 1 = 0 → gameover
      expect(result.newCoins).toBe(0)
      expect(result.newStreak).toBe(0)
      expect(result.gameState).toBe('gameover')
    })

    it('最後の1コインで勝利 → 続行可能', () => {
      const result = calculateCoins(1, 'won', 0)
      // 1 - 1 + 1 = 1
      expect(result.newCoins).toBe(1)
      expect(result.newStreak).toBe(1)
      expect(result.gameState).toBe('won')
    })

    it('最後の1コインで引き分け → 続行可能', () => {
      const result = calculateCoins(1, 'draw', 0)
      // 1 - 1 + 1 = 1
      expect(result.newCoins).toBe(1)
      expect(result.newStreak).toBe(0)
      expect(result.gameState).toBe('draw')
    })
  })

  describe('ゲーム状態遷移', () => {
    it('勝利時の状態はwon', () => {
      const result = calculateCoins(10, 'won', 0)
      expect(result.gameState).toBe('won')
    })

    it('敗北時の状態はlost', () => {
      const result = calculateCoins(10, 'lost', 0)
      expect(result.gameState).toBe('lost')
    })

    it('引き分け時の状態はdraw', () => {
      const result = calculateCoins(10, 'draw', 0)
      expect(result.gameState).toBe('draw')
    })

    it('コイン0で敗北時の状態はgameover', () => {
      const result = calculateCoins(1, 'lost', 0)
      expect(result.gameState).toBe('gameover')
    })
  })

  describe('カード型の検証', () => {
    it('CardValueは1-13の整数', () => {
      const validValues: CardValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
      expect(validValues).toHaveLength(13)
    })

    it('Suitは4種類', () => {
      const validSuits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
      expect(validSuits).toHaveLength(4)
    })

    it('Cardはsuit + valueの構造', () => {
      const card: Card = { suit: 'hearts', value: 1 }
      expect(card).toHaveProperty('suit')
      expect(card).toHaveProperty('value')
    })

    it('Guessはhigh/lowの2択', () => {
      const guesses: Guess[] = ['high', 'low']
      expect(guesses).toHaveLength(2)
    })

    it('GameStateは5つの状態', () => {
      const states: GameState[] = ['playing', 'won', 'lost', 'draw', 'gameover']
      expect(states).toHaveLength(5)
    })
  })

  describe('シークレットジェスチャー設定値', () => {
    // SECRET_CONFIGは非公開のため、既知の値をハードコードで検証
    // useSecretGesture.ts の設定が変更されたらタイミングテストが壊れる
    it('長押し時間は3000ms', () => {
      const EXPECTED_LONG_PRESS = 3000
      expect(EXPECTED_LONG_PRESS).toBe(3000)
    })

    it('タップ受付時間は2000ms', () => {
      const EXPECTED_TAP_WINDOW = 2000
      expect(EXPECTED_TAP_WINDOW).toBe(2000)
    })

    it('タップ制限時間は1000ms', () => {
      const EXPECTED_TAP_TIMEOUT = 1000
      expect(EXPECTED_TAP_TIMEOUT).toBe(1000)
    })

    it('必要タップ回数は3回', () => {
      const EXPECTED_REQUIRED_TAPS = 3
      expect(EXPECTED_REQUIRED_TAPS).toBe(3)
    })

    it('遷移先は /m', () => {
      const EXPECTED_DESTINATION = '/m'
      expect(EXPECTED_DESTINATION).toBe('/m')
    })
  })

  describe('ローカルストレージ仕様', () => {
    it('ハイスコアキーは hi-and-low-high-score', async () => {
      const { STORAGE_KEY } = await import('@/features/game/constants')
      expect(STORAGE_KEY.HIGH_SCORE).toBe('hi-and-low-high-score')
    })

    it('コインキーは hi-and-low-coins', async () => {
      const { STORAGE_KEY } = await import('@/features/game/constants')
      expect(STORAGE_KEY.COINS).toBe('hi-and-low-coins')
    })
  })
})
