'use client'

import type { RankingEntry } from '../types'

interface RankingProps {
  readonly entries: readonly RankingEntry[]
  readonly className?: string
  /** シークレットアクティベーション状態（微妙な色変化） */
  readonly isSecretActivated?: boolean
}

/**
 * ランクに応じたアイコンを取得
 */
function getRankIcon(rank: number): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return String(rank)
}

/**
 * ランキング表示コンポーネント
 */
export function Ranking({
  entries,
  className = '',
  isSecretActivated = false,
}: RankingProps): React.JSX.Element {
  return (
    <div
      className={`rounded-lg p-4 transition-colors duration-300 ${
        isSecretActivated ? 'bg-gray-50' : 'bg-gray-100'
      } ${className}`}
    >
      <h2 className="mb-3 text-center text-lg font-bold text-gray-800">🏆 ランキング</h2>
      <div className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.rank}
            className="flex items-center justify-between rounded-md bg-white px-3 py-2 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 text-center font-bold text-gray-500">
                {getRankIcon(entry.rank)}
              </span>
              <span className="font-medium text-gray-700">{entry.name}</span>
            </div>
            <span className="font-bold text-blue-600">{entry.score}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
