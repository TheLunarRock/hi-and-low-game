'use client'

import { RANKING_DATA } from '../constants'
import { useGame } from '../hooks/useGame'
import { Card } from './Card'
import { Ranking } from './Ranking'

interface GameBoardProps {
  /** シークレットアクティベーション状態 */
  readonly isSecretActivated?: boolean
}

/**
 * ゲームボードコンポーネント
 */
export function GameBoard({ isSecretActivated = false }: GameBoardProps): React.JSX.Element {
  const { currentCard, nextCard, gameState, streak, highScore, isRevealing, makeGuess, resetGame } =
    useGame()

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-green-800 to-green-900 px-4 py-8">
      {/* ヘッダー */}
      <header className="mb-6 flex items-center justify-center gap-2">
        <span className="text-3xl">🃏</span>
        <h1 className="text-3xl font-bold text-white">Hi & Low</h1>
      </header>

      {/* スコア表示 */}
      <div className="mb-6 flex justify-center gap-8">
        <div className="text-center">
          <p className="text-sm text-green-200">連勝</p>
          <p className="text-2xl font-bold text-white">{streak}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-green-200">ハイスコア</p>
          <p className="text-2xl font-bold text-yellow-400">{highScore}</p>
        </div>
      </div>

      {/* カード表示エリア */}
      <div className="mb-8 flex items-center justify-center gap-4">
        <Card card={currentCard} />
        <div className="flex flex-col items-center">
          <span className="text-2xl text-white">→</span>
        </div>
        <Card card={nextCard} isHidden={!isRevealing && nextCard === null} />
      </div>

      {/* ゲーム状態メッセージ */}
      {gameState === 'won' && (
        <div className="mb-4 text-center">
          <p className="text-xl font-bold text-yellow-400">🎉 正解！</p>
        </div>
      )}

      {gameState === 'lost' && (
        <div className="mb-4 text-center">
          <p className="text-xl font-bold text-red-400">💥 残念！</p>
          <p className="text-sm text-gray-300">連勝記録: {streak}</p>
        </div>
      )}

      {/* 操作ボタン */}
      <div className="mb-8 flex justify-center gap-4">
        <GameButtons
          gameState={gameState}
          isRevealing={isRevealing}
          onHigh={() => makeGuess('high')}
          onLow={() => makeGuess('low')}
          onReset={resetGame}
        />
      </div>

      {/* ルール説明 */}
      <div className="mb-8 text-center text-sm text-green-200">
        <p>次のカードが現在のカードより「高い」か「低い」かを予想しよう！</p>
        <p className="mt-1 text-xs text-green-300">同じ数字の場合は両方正解になります</p>
      </div>

      {/* ランキング */}
      <div className="mx-auto w-full max-w-sm">
        <Ranking entries={RANKING_DATA} isSecretActivated={isSecretActivated} />
      </div>
    </div>
  )
}

/**
 * ゲームボタンコンポーネント（ネストした三項演算子を解消）
 */
function GameButtons({
  gameState,
  isRevealing,
  onHigh,
  onLow,
  onReset,
}: {
  readonly gameState: 'playing' | 'won' | 'lost'
  readonly isRevealing: boolean
  readonly onHigh: () => void
  readonly onLow: () => void
  readonly onReset: () => void
}): React.JSX.Element {
  if (gameState === 'playing' && !isRevealing) {
    return (
      <>
        <button
          type="button"
          onClick={onHigh}
          className="rounded-lg bg-red-500 px-8 py-4 text-xl font-bold text-white shadow-lg transition-all hover:bg-red-600 hover:shadow-xl active:scale-95"
        >
          ⬆️ HIGH
        </button>
        <button
          type="button"
          onClick={onLow}
          className="rounded-lg bg-blue-500 px-8 py-4 text-xl font-bold text-white shadow-lg transition-all hover:bg-blue-600 hover:shadow-xl active:scale-95"
        >
          ⬇️ LOW
        </button>
      </>
    )
  }

  if (gameState === 'lost') {
    return (
      <button
        type="button"
        onClick={onReset}
        className="rounded-lg bg-yellow-500 px-8 py-4 text-xl font-bold text-white shadow-lg transition-all hover:bg-yellow-600 hover:shadow-xl active:scale-95"
      >
        🔄 もう一度
      </button>
    )
  }

  return <div className="px-8 py-4 text-xl text-white">判定中...</div>
}
