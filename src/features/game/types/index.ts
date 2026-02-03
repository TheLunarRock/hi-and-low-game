/**
 * Hi & Low ゲームの型定義
 */

/**
 * トランプのスート（マーク）
 */
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'

/**
 * カードの値（1-13: A-K）
 */
export type CardValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13

/**
 * カード
 */
export interface Card {
  readonly suit: Suit
  readonly value: CardValue
}

/**
 * プレイヤーの予想
 */
export type Guess = 'high' | 'low'

/**
 * ゲームの状態
 */
export type GameState = 'playing' | 'won' | 'lost'

/**
 * ゲーム結果
 */
export interface GameResult {
  readonly state: GameState
  readonly currentCard: Card
  readonly nextCard: Card | null
  readonly streak: number
  readonly highScore: number
}

/**
 * ランキングエントリ
 */
export interface RankingEntry {
  readonly rank: number
  readonly name: string
  readonly score: number
}
