/**
 * Hi & Low ゲームの定数
 */

import type { RankingEntry, Suit } from '../types'

/**
 * スート一覧
 */
export const SUITS: readonly Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'] as const

/**
 * スートの表示用絵文字
 */
export const SUIT_EMOJI: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
} as const

/**
 * スートの色
 */
export const SUIT_COLOR: Record<Suit, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-gray-900',
  spades: 'text-gray-900',
} as const

/**
 * カード値の表示用文字
 */
export const VALUE_DISPLAY: Record<number, string> = {
  1: 'A',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
} as const

/**
 * ダミーランキングデータ
 */
export const RANKING_DATA: readonly RankingEntry[] = [
  { rank: 1, name: 'Player1', score: 15 },
  { rank: 2, name: 'Player2', score: 12 },
  { rank: 3, name: 'Player3', score: 10 },
  { rank: 4, name: 'Player4', score: 8 },
  { rank: 5, name: 'Player5', score: 5 },
] as const

/**
 * ローカルストレージキー
 */
export const STORAGE_KEY = {
  HIGH_SCORE: 'hi-and-low-high-score',
} as const
