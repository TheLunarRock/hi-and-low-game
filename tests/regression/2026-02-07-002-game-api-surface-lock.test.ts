/**
 * Bug ID: 2026-02-07-002
 * Date: 2026-02-07
 * Issue: ゲーム公開APIのロックダウン - index.tsの公開APIが変更されていないことを検証
 * Feature: game
 * Fixed by: N/A - 保護テスト（削除禁止）
 */

import { describe, expect, it } from 'vitest'

import * as gameModule from '@/features/game'

describe('Lockdown: ゲーム公開API v1.0.0', () => {
  describe('エクスポートされたメンバー', () => {
    it('GameBoardのみがnamed exportされている', () => {
      const exportedKeys = Object.keys(gameModule)
      expect(exportedKeys).toEqual(['GameBoard'])
    })

    it('GameBoardは関数（Reactコンポーネント）である', () => {
      expect(typeof gameModule.GameBoard).toBe('function')
    })

    it('エクスポート数は1つのみ', () => {
      expect(Object.keys(gameModule)).toHaveLength(1)
    })
  })

  describe('内部実装が漏洩していないこと', () => {
    it('useGameフックが公開されていない', () => {
      expect('useGame' in gameModule).toBe(false)
    })

    it('useSecretGestureフックが公開されていない', () => {
      expect('useSecretGesture' in gameModule).toBe(false)
    })

    it('Cardコンポーネントが公開されていない', () => {
      expect('Card' in gameModule).toBe(false)
    })

    it('Rankingコンポーネントが公開されていない', () => {
      expect('Ranking' in gameModule).toBe(false)
    })

    it('INITIAL_COINS定数が公開されていない', () => {
      expect('INITIAL_COINS' in gameModule).toBe(false)
    })

    it('RANKING_DATA定数が公開されていない', () => {
      expect('RANKING_DATA' in gameModule).toBe(false)
    })

    it('SUITS定数が公開されていない', () => {
      expect('SUITS' in gameModule).toBe(false)
    })

    it('STORAGE_KEY定数が公開されていない', () => {
      expect('STORAGE_KEY' in gameModule).toBe(false)
    })
  })

  describe('RankingEntry型の構造検証', () => {
    it('RankingEntry型に準拠したオブジェクトが作成できる', () => {
      // TypeScriptの型はランタイムでは消えるため、
      // 構造的な型チェックとしてオブジェクトリテラルで検証
      const validEntry: import('@/features/game').RankingEntry = {
        rank: 1,
        name: 'TestPlayer',
        score: 100,
      }
      expect(validEntry.rank).toBe(1)
      expect(validEntry.name).toBe('TestPlayer')
      expect(validEntry.score).toBe(100)
    })

    it('RankingEntryは rank, name, score の3プロパティを持つ', () => {
      const entry: import('@/features/game').RankingEntry = {
        rank: 1,
        name: 'Test',
        score: 0,
      }
      expect(Object.keys(entry)).toHaveLength(3)
      expect(Object.keys(entry).sort((a, b) => a.localeCompare(b))).toEqual([
        'name',
        'rank',
        'score',
      ])
    })
  })
})
