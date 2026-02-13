'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { useAuthContext, addFriendByCode } from '@/features/messenger'

export default function AddFriendPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [friendCode, setFriendCode] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  if (user === null) return null

  const friendUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/m/add/${user.friend_code}`

  async function handleAddFriend() {
    if (user === null || friendCode.trim() === '') return
    setIsAdding(true)
    setError(null)
    setSuccess(null)

    try {
      const friendProfile = await addFriendByCode(user.id, friendCode.trim())
      setSuccess(`${friendProfile.display_name}さんをフレンドに追加しました`)
      setFriendCode('')
      // Redirect to friends list after short delay
      setTimeout(() => {
        router.push('/m/friends')
      }, 1500)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'フレンド追加に失敗しました'
      setError(message)
    } finally {
      setIsAdding(false)
    }
  }

  async function handleCopyCode() {
    try {
      if (user === null) return
      await navigator.clipboard.writeText(user.friend_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/m/friends" className="text-2xl text-gray-600">
          {'\u2190'}
        </Link>
        <h1 className="text-xl font-bold text-gray-800">フレンド追加</h1>
      </div>

      {/* My QR code */}
      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-center text-sm font-bold text-gray-600">マイQRコード</h2>
        <div className="flex justify-center">
          <div className="rounded-xl bg-white p-3">
            <QRCodeSVG value={friendUrl} size={180} level="M" />
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="mb-2 text-xs text-gray-500">フレンドコード</p>
          <div className="flex items-center justify-center gap-2">
            <span className="font-mono text-lg font-bold text-gray-800">{user.friend_code}</span>
            <button
              type="button"
              onClick={() => {
                void handleCopyCode()
              }}
              className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200"
            >
              {copied ? '\u2705 コピー済み' : 'コピー'}
            </button>
          </div>
        </div>
      </div>

      {/* Add by code */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-gray-600">コードで追加</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={friendCode}
            onChange={(e) => setFriendCode(e.target.value)}
            placeholder="フレンドコードを入力"
            maxLength={20}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <button
            type="button"
            onClick={() => {
              void handleAddFriend()
            }}
            disabled={isAdding || friendCode.trim() === ''}
            className="shrink-0 rounded-lg bg-blue-500 px-5 py-3 font-bold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAdding ? '...' : '追加'}
          </button>
        </div>

        {error !== null && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {success !== null && <p className="mt-3 text-sm text-green-600">{success}</p>}
      </div>
    </div>
  )
}
