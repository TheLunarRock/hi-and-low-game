/**
 * Hi & Low ゲームの定数
 */

import type { CardValue, RankingEntry, Suit } from '../types'

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
 * カード値の表示用文字（型安全性向上: number → CardValue）
 */
export const VALUE_DISPLAY: Record<CardValue, string> = {
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
 * ランキングデータ
 */
export const RANKING_DATA: readonly RankingEntry[] = [
  { rank: 1, name: 'RIKI', score: 47 },
  { rank: 2, name: 'Boo', score: 40 },
  { rank: 3, name: 'Itusuki', score: 39 },
  { rank: 4, name: 'MAIKO', score: 33 },
  { rank: 5, name: 'DAI', score: 31 },
] as const

/**
 * 初期コイン数
 */
export const INITIAL_COINS = 10

/**
 * アニメーション遅延時間（ミリ秒）
 */
export const ANIMATION_DELAY = {
  /** カード判定までの遅延 */
  REVEAL: 500,
  /** 次のラウンドへの遷移遅延 */
  NEXT_ROUND: 1000,
} as const

/**
 * ローカルストレージキー
 */
export const STORAGE_KEY = {
  HIGH_SCORE: 'hi-and-low-high-score',
  COINS: 'hi-and-low-coins',
} as const

/**
 * トースト通知設定
 */
export const TOAST_CONFIG = {
  /** アニメーション開始までの遅延（ミリ秒） */
  ENTER_DELAY: 50,
  /** 表示時間（ミリ秒） */
  DISPLAY_DURATION: 3000,
  /** 非表示までの総時間（ミリ秒） */
  HIDE_DELAY: 3500,
} as const
