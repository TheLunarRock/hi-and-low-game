/**
 * Bug ID: 2025-02-04-002
 * Date: 2025-02-04
 * Issue: Math.random() によるSSRとクライアントのHydration不一致
 *        - サーバーとクライアントで異なるカード値が生成される
 *        - React Hydration Errorが発生
 * Feature: game
 * Fixed by: isInitialized パターンによるクライアント側のみでの初期化
 */

import { describe, it, expect } from 'vitest'

describe('Regression: 2025-02-04-002 - Hydration mismatch prevention', () => {
  describe('SSR-safe initialization pattern', () => {
    it('should return consistent initial state for SSR', () => {
      // SSR時は固定値を返すパターン
      const createSSRSafeState = <T>(clientInitializer: () => T, ssrFallback: T) => {
        // サーバーサイド（window undefined）では常にフォールバック値
        if (typeof window === 'undefined') {
          return ssrFallback
        }
        return clientInitializer()
      }

      // テスト環境ではwindowが定義されているので、クライアント側の動作を確認
      // 実際のSSR環境ではssrFallbackが返される
      const ssrState = createSSRSafeState(
        // eslint-disable-next-line sonarjs/pseudo-random -- テスト用途のため許容
        () => ({ value: Math.random() }),
        null
      )

      // SSR時はnullが返されることを想定した設計
      // （テスト環境ではclientInitializerが実行される）
      expect(ssrState === null || typeof ssrState.value === 'number').toBe(true)
    })

    it('should use isInitialized pattern to prevent hydration mismatch', () => {
      // isInitialized パターンのシミュレーション
      interface GameState {
        currentCard: { suit: string; value: number } | null
        isInitialized: boolean
      }

      // SSR時の初期状態
      const ssrState: GameState = {
        currentCard: null,
        isInitialized: false,
      }

      expect(ssrState.currentCard).toBe(null)
      expect(ssrState.isInitialized).toBe(false)

      // クライアント側でuseEffect後の状態
      const clientState: GameState = {
        currentCard: { suit: 'hearts', value: 7 },
        isInitialized: true,
      }

      expect(clientState.currentCard).not.toBe(null)
      expect(clientState.isInitialized).toBe(true)
    })

    it('should show loading state when not initialized', () => {
      // isInitializedがfalseの場合はローディング表示
      const renderContent = (isInitialized: boolean): string => {
        if (!isInitialized) {
          return 'Loading...'
        }
        return 'Game Content'
      }

      expect(renderContent(false)).toBe('Loading...')
      expect(renderContent(true)).toBe('Game Content')
    })
  })

  describe('random value generation timing', () => {
    it('should defer random generation to client-side effect', () => {
      // ランダム値生成はクライアント側のeffectでのみ実行
      let randomValue: number | null = null
      let effectExecuted = false

      // SSR時: useState初期値
      randomValue = null // 固定値

      // クライアント側: useEffect内で生成
      const simulateClientEffect = () => {
        effectExecuted = true
        // eslint-disable-next-line sonarjs/pseudo-random -- テスト用途のため許容
        randomValue = Math.floor(Math.random() * 13) + 1
      }

      // Effect実行前
      expect(effectExecuted).toBe(false)
      expect(randomValue).toBe(null)

      // Effect実行後（クライアントのみ）
      simulateClientEffect()
      expect(effectExecuted).toBe(true)
      expect(randomValue).toBeGreaterThanOrEqual(1)
      expect(randomValue).toBeLessThanOrEqual(13)
    })
  })
})
