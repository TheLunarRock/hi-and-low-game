import Link from 'next/link'

/**
 * メッセンジャー フレンド一覧ページ（プレースホルダー）
 * LINEのようなフレンド一覧画面になる予定
 */
export default function MessengerPage(): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-800 to-blue-900 px-4 py-8">
      {/* ヘッダー */}
      <header className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="rounded-lg bg-white/10 px-4 py-2 text-white transition-colors hover:bg-white/20"
        >
          ← 戻る
        </Link>
        <h1 className="text-2xl font-bold text-white">フレンド</h1>
        <div className="w-16" /> {/* スペーサー */}
      </header>

      {/* フレンド一覧（プレースホルダー） */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="text-6xl">💬</div>
        <p className="mt-4 text-xl text-white">メッセンジャー</p>
        <p className="mt-2 text-sm text-blue-200">（実装予定）</p>
      </div>
    </div>
  )
}
