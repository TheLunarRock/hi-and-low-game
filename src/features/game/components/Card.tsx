'use client'

import { SUIT_COLOR, SUIT_EMOJI, VALUE_DISPLAY } from '../constants'
import type { Card as CardType } from '../types'

interface CardProps {
  readonly card: CardType | null
  readonly isHidden?: boolean
  readonly className?: string
}

/**
 * トランプカードコンポーネント
 */
export function Card({ card, isHidden = false, className = '' }: CardProps): React.JSX.Element {
  // 裏面表示
  if (isHidden || card === null) {
    return (
      <div
        className={`flex h-36 w-24 items-center justify-center rounded-lg border-2 border-gray-300 bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg ${className}`}
      >
        <span className="text-4xl">🃏</span>
      </div>
    )
  }

  const suitEmoji = SUIT_EMOJI[card.suit]
  const suitColor = SUIT_COLOR[card.suit]
  const valueDisplay = VALUE_DISPLAY[card.value]

  return (
    <div
      className={`flex h-36 w-24 flex-col justify-between rounded-lg border-2 border-gray-300 bg-white p-2 shadow-lg ${className}`}
    >
      {/* 左上 */}
      <div className={`flex flex-col items-start ${suitColor}`}>
        <span className="text-lg font-bold leading-none">{valueDisplay}</span>
        <span className="text-sm leading-none">{suitEmoji}</span>
      </div>

      {/* 中央 */}
      <div className={`flex items-center justify-center ${suitColor}`}>
        <span className="text-3xl">{suitEmoji}</span>
      </div>

      {/* 右下（逆さま） */}
      <div className={`flex rotate-180 flex-col items-start ${suitColor}`}>
        <span className="text-lg font-bold leading-none">{valueDisplay}</span>
        <span className="text-sm leading-none">{suitEmoji}</span>
      </div>
    </div>
  )
}
