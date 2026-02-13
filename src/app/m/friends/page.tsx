'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthContext, getFriends, createDirectConversation } from '@/features/messenger'
import type { Profile } from '@/features/messenger'

export default function FriendsPage() {
  const { user } = useAuthContext()
  const [friends, setFriends] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user === null) return

    let isMounted = true

    async function loadFriends() {
      try {
        if (user === null) return
        const data = await getFriends(user.id)
        if (isMounted) {
          setFriends(data)
        }
      } catch {
        if (isMounted) {
          setError('フレンド一覧の取得に失敗しました')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadFriends()

    return () => {
      isMounted = false
    }
  }, [user])

  if (user === null) return null

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">フレンド</h1>
        <Link
          href="/m/friends/add"
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-600"
        >
          追加
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      )}

      {error !== null && (
        <div className="rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">{error}</div>
      )}

      {!isLoading && error === null && friends.length === 0 && (
        <div className="py-12 text-center">
          <p className="mb-2 text-4xl">{'\uD83D\uDC65'}</p>
          <p className="mb-4 text-gray-500">フレンドがまだいません</p>
          <Link
            href="/m/friends/add"
            className="inline-block rounded-lg bg-blue-500 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-600"
          >
            フレンドを追加する
          </Link>
        </div>
      )}

      {!isLoading && friends.length > 0 && <FriendList friends={friends} userId={user.id} />}
    </div>
  )
}

function FriendList({ friends, userId }: { readonly friends: Profile[]; readonly userId: string }) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleStartChat(friendId: string) {
    setLoadingId(friendId)
    try {
      const conversation = await createDirectConversation(userId, friendId)
      router.push(`/m/chat/${conversation.id}`)
    } catch {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-1">
      {friends.map((friend) => (
        <button
          key={friend.id}
          type="button"
          onClick={() => {
            void handleStartChat(friend.id)
          }}
          disabled={loadingId !== null}
          className="flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-60"
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ backgroundColor: friend.avatar_color }}
          >
            {friend.avatar_text}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-gray-800">{friend.display_name}</p>
          </div>
          {loadingId === friend.id && (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          )}
        </button>
      ))}
    </div>
  )
}
