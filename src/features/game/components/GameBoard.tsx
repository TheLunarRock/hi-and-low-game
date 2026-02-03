'use client'

import { RANKING_DATA } from '../constants'
import { useGame } from '../hooks/useGame'
import type { GameState } from '../types'
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
  const {
    currentCard,
    nextCard,
    gameState,
    streak,
    highScore,
    coins,
    isRevealing,
    isInitialized,
    makeGuess,
    resetGame,
    fullReset,
  } = useGame()

  // SSR/Hydration時はローディング表示（Math.random()の不一致を回避）
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-800 to-green-900">
        <span className="text-4xl">🃏</span>
        <p className="mt-4 text-xl text-white">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-green-800 to-green-900 px-4 py-8">
      {/* ヘッダー */}
      <header className="mb-6 flex items-center justify-center gap-2">
        <span className="text-3xl">🃏</span>
        <h1 className="text-3xl font-bold text-white">Hi & Low</h1>
      </header>

      {/* スコア表示 */}
      <div className="mb-6 flex justify-center gap-6">
        <div className="text-center">
          <p className="text-sm text-green-200">コイン</p>
          <p className="text-2xl font-bold text-yellow-300">🪙 {coins}</p>
        </div>
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
        <Card card={currentCard} isHidden={currentCard === null} />
        <div className="flex flex-col items-center">
          <span className="text-2xl text-white">→</span>
        </div>
        <Card card={nextCard} isHidden={!isRevealing && nextCard === null} />
      </div>

      {/* 操作ボタン＋状態メッセージ（同じ高さに配置） */}
      <div className="mb-8 flex min-h-[72px] items-center justify-center gap-4">
        <GameButtons
          gameState={gameState}
          isRevealing={isRevealing}
          coins={coins}
          streak={streak}
          onHigh={() => makeGuess('high')}
          onLow={() => makeGuess('low')}
          onReset={resetGame}
          onFullReset={fullReset}
        />
      </div>

      {/* ルール説明 */}
      <div className="mb-8 text-center text-sm text-green-200">
        <p>次のカードが現在のカードより「高い」か「低い」かを予想しよう！</p>
        <p className="mt-1 text-xs text-green-300">
          1ゲーム1コイン消費 | 勝利: 連勝数分のコイン獲得 | ドロー: コイン返却
        </p>
      </div>

      {/* ランキング */}
      <div className="mx-auto w-full max-w-sm">
        <Ranking entries={RANKING_DATA} isSecretActivated={isSecretActivated} />
      </div>
    </div>
  )
}

/**
 * ゲームボタンコンポーネント（状態メッセージ統合）
 */
function GameButtons({
  gameState,
  isRevealing,
  coins,
  streak,
  onHigh,
  onLow,
  onReset,
  onFullReset,
}: {
  readonly gameState: GameState
  readonly isRevealing: boolean
  readonly coins: number
  readonly streak: number
  readonly onHigh: () => void
  readonly onLow: () => void
  readonly onReset: () => void
  readonly onFullReset: () => void
}): React.JSX.Element {
  if (gameState === 'gameover') {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="text-lg font-bold text-red-500">💀 ゲームオーバー</p>
        <button
          type="button"
          onClick={onFullReset}
          className="rounded-lg bg-purple-500 px-8 py-4 text-xl font-bold text-white shadow-lg transition-all hover:bg-purple-600 hover:shadow-xl active:scale-95"
        >
          🔄 最初からやり直す
        </button>
      </div>
    )
  }

  if (gameState === 'playing' && !isRevealing && coins > 0) {
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

  if (gameState === 'won') {
    return (
      <div className="rounded-lg bg-yellow-500/20 px-8 py-4 text-xl font-bold text-yellow-400">
        🎉 正解！ +{streak}コイン
      </div>
    )
  }

  if (gameState === 'draw') {
    return (
      <div className="rounded-lg bg-blue-500/20 px-8 py-4 text-xl font-bold text-blue-300">
        🤝 ドロー！コイン返却
      </div>
    )
  }

  if (gameState === 'lost') {
    return (
      <button
        type="button"
        onClick={onReset}
        className="rounded-lg bg-yellow-500 px-8 py-4 text-xl font-bold text-white shadow-lg transition-all hover:bg-yellow-600 hover:shadow-xl active:scale-95"
      >
        💥 続ける
      </button>
    )
  }

  return <div className="px-8 py-4 text-xl text-white">判定中...</div>
}
