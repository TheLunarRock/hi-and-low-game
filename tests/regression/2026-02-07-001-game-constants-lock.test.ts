/**
 * Bug ID: 2026-02-07-001
 * Date: 2026-02-07
 * Issue: ゲーム定数のロックダウン - v1.0.0安定版の定数値が変更されていないことを検証
 * Feature: game
 * Fixed by: N/A - 保護テスト（削除禁止）
 */

import { describe, expect, it } from 'vitest'

import {
  ANIMATION_DELAY,
  INITIAL_COINS,
  RANKING_DATA,
  STORAGE_KEY,
  SUITS,
  SUIT_COLOR,
  SUIT_EMOJI,
  TOAST_CONFIG,
  VALUE_DISPLAY,
} from '@/features/game/constants'

describe('Lockdown: ゲーム定数 v1.0.0', () => {
  describe('SUITS（スート一覧）', () => {
    it('4つのスートが正しい順序で定義されている', () => {
      expect(SUITS).toEqual(['hearts', 'diamonds', 'clubs', 'spades'])
      expect(SUITS).toHaveLength(4)
    })
  })

  describe('SUIT_EMOJI（スート絵文字）', () => {
    it('各スートに正しい絵文字が設定されている', () => {
      expect(SUIT_EMOJI).toEqual({
        hearts: '♥',
        diamonds: '♦',
        clubs: '♣',
        spades: '♠',
      })
    })
  })

  describe('SUIT_COLOR（スート色）', () => {
    it('赤スートはtext-red-500、黒スートはtext-gray-900', () => {
      expect(SUIT_COLOR).toEqual({
        hearts: 'text-red-500',
        diamonds: 'text-red-500',
        clubs: 'text-gray-900',
        spades: 'text-gray-900',
      })
    })
  })

  describe('VALUE_DISPLAY（カード値表示）', () => {
    it('13枚分の表示文字が正しく定義されている', () => {
      expect(VALUE_DISPLAY[1]).toBe('A')
      expect(VALUE_DISPLAY[2]).toBe('2')
      expect(VALUE_DISPLAY[3]).toBe('3')
      expect(VALUE_DISPLAY[4]).toBe('4')
      expect(VALUE_DISPLAY[5]).toBe('5')
      expect(VALUE_DISPLAY[6]).toBe('6')
      expect(VALUE_DISPLAY[7]).toBe('7')
      expect(VALUE_DISPLAY[8]).toBe('8')
      expect(VALUE_DISPLAY[9]).toBe('9')
      expect(VALUE_DISPLAY[10]).toBe('10')
      expect(VALUE_DISPLAY[11]).toBe('J')
      expect(VALUE_DISPLAY[12]).toBe('Q')
      expect(VALUE_DISPLAY[13]).toBe('K')
    })

    it('13個のキーが存在する', () => {
      expect(Object.keys(VALUE_DISPLAY)).toHaveLength(13)
    })
  })

  describe('RANKING_DATA（ランキング）', () => {
    it('5名の正確なランキングデータ', () => {
      expect(RANKING_DATA).toEqual([
        { rank: 1, name: 'RIKI', score: 47 },
        { rank: 2, name: 'Boo', score: 40 },
        { rank: 3, name: 'Itusuki', score: 39 },
        { rank: 4, name: 'MAIKO', score: 33 },
        { rank: 5, name: 'DAI', score: 31 },
      ])
    })

    it('5名のランキングデータが存在する', () => {
      expect(RANKING_DATA).toHaveLength(5)
    })

    it('ランクは1から5の連番', () => {
      RANKING_DATA.forEach((entry, index) => {
        expect(entry.rank).toBe(index + 1)
      })
    })

    it('スコアは降順', () => {
      for (let i = 0; i < RANKING_DATA.length - 1; i++) {
        expect(RANKING_DATA[i].score).toBeGreaterThan(RANKING_DATA[i + 1].score)
      }
    })
  })

  describe('INITIAL_COINS（初期コイン数）', () => {
    it('初期コインは10枚', () => {
      expect(INITIAL_COINS).toBe(10)
    })
  })

  describe('ANIMATION_DELAY（アニメーション遅延）', () => {
    it('カード判定遅延は500ms', () => {
      expect(ANIMATION_DELAY.REVEAL).toBe(500)
    })

    it('次ラウンド遷移遅延は1000ms', () => {
      expect(ANIMATION_DELAY.NEXT_ROUND).toBe(1000)
    })

    it('2つの遅延設定のみ存在する', () => {
      expect(Object.keys(ANIMATION_DELAY)).toHaveLength(2)
    })
  })

  describe('STORAGE_KEY（ローカルストレージキー）', () => {
    it('ハイスコアキーは hi-and-low-high-score', () => {
      expect(STORAGE_KEY.HIGH_SCORE).toBe('hi-and-low-high-score')
    })

    it('コインキーは hi-and-low-coins', () => {
      expect(STORAGE_KEY.COINS).toBe('hi-and-low-coins')
    })

    it('2つのキーのみ存在する', () => {
      expect(Object.keys(STORAGE_KEY)).toHaveLength(2)
    })
  })

  describe('TOAST_CONFIG（トースト通知設定）', () => {
    it('表示開始遅延は50ms', () => {
      expect(TOAST_CONFIG.ENTER_DELAY).toBe(50)
    })

    it('表示時間は3000ms', () => {
      expect(TOAST_CONFIG.DISPLAY_DURATION).toBe(3000)
    })

    it('非表示までの総時間は3500ms', () => {
      expect(TOAST_CONFIG.HIDE_DELAY).toBe(3500)
    })

    it('3つの設定のみ存在する', () => {
      expect(Object.keys(TOAST_CONFIG)).toHaveLength(3)
    })
  })
})
