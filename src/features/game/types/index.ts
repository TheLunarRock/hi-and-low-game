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
 * - playing: プレイ中
 * - won: 正解
 * - lost: 不正解
 * - draw: 引き分け（同じ数字）
 * - gameover: コイン切れ
 */
export type GameState = 'playing' | 'won' | 'lost' | 'draw' | 'gameover'

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
