'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthContext, getProfileByFriendCode, addFriendByCode } from '@/features/messenger'
import type { Profile } from '@/features/messenger'

export default function AddFriendByUrlPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuthContext()

  const friendCode = typeof params.friendCode === 'string' ? params.friendCode : ''

  const [targetProfile, setTargetProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState(false)

  // Fetch the target user's profile
  useEffect(() => {
    if (friendCode === '') return

    let isMounted = true

    async function loadProfile() {
      try {
        const profile = await getProfileByFriendCode(friendCode)
        if (isMounted) {
          setTargetProfile(profile)
        }
      } catch {
        if (isMounted) {
          setError('プロフィールの取得に失敗しました')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadProfile()

    return () => {
      isMounted = false
    }
  }, [friendCode])

  async function handleAddFriend() {
    if (user === null) return
    setIsAdding(true)
    setError(null)

    try {
      await addFriendByCode(user.id, friendCode)
      setAdded(true)
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

  // Loading state
  if (isLoading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  // Friend code not found
  if (targetProfile === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <p className="mb-2 text-4xl">{'\u{1F6AB}'}</p>
          <p className="mb-4 text-gray-600">このフレンドコードは見つかりません</p>
          <Link href="/m" className="text-blue-500 hover:text-blue-600">
            トップに戻る
          </Link>
        </div>
      </div>
    )
  }

  // Self-add check
  const isSelf = user !== null && user.id === targetProfile.id

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-lg">
        {/* Target profile avatar */}
        <div
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold text-white"
          style={{ backgroundColor: targetProfile.avatar_color }}
        >
          {targetProfile.avatar_text}
        </div>
        <h2 className="mt-4 text-xl font-bold text-gray-800">{targetProfile.display_name}</h2>
        <p className="mt-1 text-sm text-gray-500">フレンドとして追加</p>

        {added && (
          <div className="mt-6 rounded-lg bg-green-50 p-3">
            <p className="font-medium text-green-700">
              {'\u2705'} {targetProfile.display_name}さんを追加しました
            </p>
          </div>
        )}

        {!added && error !== null && (
          <div className="mt-6 rounded-lg bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!added && isAuthenticated && !isSelf && (
          <button
            type="button"
            onClick={() => {
              void handleAddFriend()
            }}
            disabled={isAdding}
            className="mt-6 w-full rounded-lg bg-blue-500 py-3 font-bold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAdding ? '追加中...' : 'フレンドに追加'}
          </button>
        )}

        {!added && isAuthenticated && isSelf && (
          <p className="mt-6 text-sm text-gray-500">自分自身のフレンドコードです</p>
        )}

        {!isAuthenticated && (
          <div className="mt-6">
            <p className="mb-3 text-sm text-gray-500">フレンドを追加するにはログインが必要です</p>
            <Link
              href="/m/login"
              className="inline-block w-full rounded-lg bg-blue-500 py-3 font-bold text-white transition-colors hover:bg-blue-600"
            >
              ログイン
            </Link>
          </div>
        )}

        <Link href="/m" className="mt-4 block text-sm text-gray-500 hover:text-gray-700">
          トップに戻る
        </Link>
      </div>
    </div>
  )
}
