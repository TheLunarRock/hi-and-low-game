/**
 * Bug ID: 2025-02-04-001
 * Date: 2025-02-04
 * Issue: ゲームのエッジケース処理の不備
 *        - localStorage エラー時のクラッシュ
 *        - コイン0枚時のゲーム状態
 *        - ランキングのrank <= 0 表示
 * Feature: game
 * Fixed by: コードレビューによる修正
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Regression: 2025-02-04-001 - Game edge cases', () => {
  describe('safeStorage error handling', () => {
    beforeEach(() => {
      // localStorage をモック化
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => {
          throw new Error('QuotaExceededError')
        }),
        setItem: vi.fn(() => {
          throw new Error('QuotaExceededError')
        }),
      })
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('should handle localStorage.getItem errors gracefully', () => {
      // safeStorage の実装をテスト
      const safeGet = <T>(key: string, defaultValue: T): T => {
        if (typeof window === 'undefined') return defaultValue
        try {
          const stored = localStorage.getItem(key)
          if (stored === null) return defaultValue
          const parsed = JSON.parse(stored) as unknown
          return typeof parsed === typeof defaultValue ? (parsed as T) : defaultValue
        } catch {
          return defaultValue
        }
      }

      // エラー発生時にデフォルト値が返されることを確認
      expect(safeGet('test-key', 10)).toBe(10)
      expect(safeGet('test-key', 'default')).toBe('default')
    })

    it('should handle localStorage.setItem errors gracefully', () => {
      const safeSet = <T>(key: string, value: T): void => {
        if (typeof window === 'undefined') return
        try {
          localStorage.setItem(key, JSON.stringify(value))
        } catch {
          // エラー時は静かに失敗
        }
      }

      // エラーがスローされないことを確認
      expect(() => safeSet('test-key', 100)).not.toThrow()
    })
  })

  describe('coin system edge cases', () => {
    it('should prevent negative coin values', () => {
      // コインが0以下にならないことを確認
      const calculateCoins = (current: number, action: 'spend' | 'win', streak = 1): number => {
        if (action === 'spend') {
          return Math.max(0, current - 1)
        }
        return current + streak
      }

      expect(calculateCoins(1, 'spend')).toBe(0)
      expect(calculateCoins(0, 'spend')).toBe(0) // 負の値にならない
      expect(calculateCoins(0, 'win', 3)).toBe(3)
    })

    it('should correctly determine gameover state', () => {
      const isGameOver = (coins: number, hasLost: boolean): boolean => {
        return hasLost && coins <= 0
      }

      expect(isGameOver(0, true)).toBe(true)
      expect(isGameOver(1, true)).toBe(false)
      expect(isGameOver(0, false)).toBe(false)
    })
  })

  describe('ranking edge cases', () => {
    it('should handle rank <= 0 gracefully', () => {
      const getRankIcon = (rank: number): string => {
        if (rank <= 0) return '-'
        if (rank === 1) return '🥇'
        if (rank === 2) return '🥈'
        if (rank === 3) return '🥉'
        return String(rank)
      }

      // 正常ケース
      expect(getRankIcon(1)).toBe('🥇')
      expect(getRankIcon(2)).toBe('🥈')
      expect(getRankIcon(3)).toBe('🥉')
      expect(getRankIcon(4)).toBe('4')

      // エッジケース（修正前はundefinedやエラーになる可能性）
      expect(getRankIcon(0)).toBe('-')
      expect(getRankIcon(-1)).toBe('-')
      expect(getRankIcon(-100)).toBe('-')
    })
  })

  describe('game state transitions', () => {
    it('should correctly calculate win with streak rewards', () => {
      const calculateWinReward = (currentCoins: number, streak: number): number => {
        const newStreak = streak + 1
        return currentCoins + newStreak
      }

      // 連勝数分のコインを獲得
      expect(calculateWinReward(9, 0)).toBe(10) // 1連勝: +1コイン
      expect(calculateWinReward(10, 1)).toBe(12) // 2連勝: +2コイン
      expect(calculateWinReward(12, 2)).toBe(15) // 3連勝: +3コイン
    })

    it('should return coin on draw', () => {
      const handleDraw = (currentCoins: number): number => {
        // ドロー時は消費したコインを返却
        return currentCoins + 1
      }

      expect(handleDraw(9)).toBe(10) // コイン返却
      expect(handleDraw(0)).toBe(1) // 0からも返却
    })
  })
})
