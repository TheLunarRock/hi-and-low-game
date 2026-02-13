'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  useAuthContext,
  createDirectConversation,
  getFriends,
  getConversations,
} from '@/features/messenger'
import type { ConversationWithDetails, Profile } from '@/features/messenger'
import { useState, useEffect, useCallback } from 'react'

/**
 * トーク一覧ページ
 * 会話を最終メッセージ時間順に表示
 */
export default function TalkListPage() {
  const router = useRouter()
  const { user } = useAuthContext()

  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewChat, setShowNewChat] = useState(false)
  const [notifPermission, setNotifPermission] = useState<string>('default')

  const loadConversations = useCallback(async () => {
    if (user === null) return

    try {
      const data = await getConversations(user.id)
      setConversations(data)
      setError(null)
    } catch {
      setError('会話の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    void loadConversations()
  }, [loadConversations])

  // Check notification permission on mount
  useEffect(() => {
    if (typeof Notification === 'undefined') {
      setNotifPermission('unsupported')
    } else {
      setNotifPermission(Notification.permission)
    }
  }, [])

  // Handle notification permission request (must be user gesture on iOS)
  function handleEnableNotifications() {
    if (typeof Notification === 'undefined') return
    void Notification.requestPermission().then((perm) => {
      setNotifPermission(perm)
    })
  }

  // Subscribe to realtime updates for talk list refresh
  useEffect(() => {
    if (user === null) return

    const channel = supabase
      .channel('talk-list-refresh')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        void loadConversations()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversations' }, () => {
        void loadConversations()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [user, loadConversations])

  function handleConversationClick(conversationId: string) {
    router.push(`/m/chat/${conversationId}`)
  }

  if (user === null) return null

  return (
    <div className="mx-auto max-w-lg">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">{'\u30C8\u30FC\u30AF'}</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/m/search"
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100"
            aria-label={'\u691C\u7D22'}
          >
            <SearchHeaderIcon />
          </Link>
          <button
            type="button"
            onClick={() => setShowNewChat(true)}
            className="rounded-full bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600"
            aria-label={'\u65B0\u3057\u3044\u30C8\u30FC\u30AF'}
          >
            <NewChatIcon />
          </button>
        </div>
      </div>

      {/* Notification permission banner */}
      {notifPermission === 'default' && (
        <div className="mx-4 mt-3 rounded-lg bg-blue-50 p-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{'\uD83D\uDD14'}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">通知を有効にしますか？</p>
              <p className="text-xs text-blue-600">新しいメッセージを受け取れます</p>
            </div>
            <button
              type="button"
              onClick={handleEnableNotifications}
              className="rounded-full bg-blue-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-blue-600"
            >
              {'\u8A31\u53EF'}
            </button>
          </div>
        </div>
      )}
      {notifPermission === 'denied' && (
        <div className="mx-4 mt-3 rounded-lg bg-amber-50 p-3">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-lg">{'\u26A0\uFE0F'}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">通知がブロックされています</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-700">
                {'iPhone: 設定 → アプリ一覧から本アプリ → 通知 → 通知を許可をON'}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-amber-700">
                {'PC: ブラウザのアドレスバー左の鍵アイコン → 通知 → 許可'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      )}

      {/* Error */}
      {error !== null && (
        <div className="mx-4 mt-4 rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && error === null && conversations.length === 0 && (
        <div className="py-16 text-center">
          <p className="mb-2 text-4xl">{'\uD83D\uDCAC'}</p>
          <p className="text-gray-500">トークがありません</p>
          <p className="mt-1 text-sm text-gray-400">フレンドにメッセージを送りましょう</p>
        </div>
      )}

      {/* Conversation list */}
      {!isLoading && conversations.length > 0 && (
        <div>
          {conversations.map((conv) => (
            <ConversationItem
              key={conv.conversation.id}
              conversation={conv}
              currentUserId={user.id}
              onClick={() => handleConversationClick(conv.conversation.id)}
            />
          ))}
        </div>
      )}

      {/* New chat modal */}
      {showNewChat && (
        <NewChatModal
          userId={user.id}
          onClose={() => setShowNewChat(false)}
          onSelect={(conversationId) => {
            setShowNewChat(false)
            router.push(`/m/chat/${conversationId}`)
          }}
          onGroupCreate={() => {
            setShowNewChat(false)
            router.push('/m/group/create')
          }}
        />
      )}
    </div>
  )
}

function ConversationItem({
  conversation: conv,
  currentUserId,
  onClick,
}: {
  readonly conversation: ConversationWithDetails
  readonly currentUserId: string
  readonly onClick: () => void
}) {
  // For DM, show the other person's info
  const otherMember = conv.members.find((m) => m.user_id !== currentUserId)
  const displayName =
    conv.conversation.type === 'group'
      ? (conv.conversation.name ?? 'グループ')
      : (otherMember?.profile.display_name ?? '不明')
  const avatarText =
    conv.conversation.type === 'group'
      ? (conv.conversation.icon_text ?? displayName.slice(0, 2))
      : (otherMember?.profile.avatar_text ?? '?')
  const avatarColor =
    conv.conversation.type === 'group'
      ? (conv.conversation.icon_color ?? '#6B7280')
      : (otherMember?.profile.avatar_color ?? '#6B7280')

  // Last message preview
  let lastMessageText = ''
  if (conv.latestMessage !== null) {
    if (conv.latestMessage.is_deleted) {
      lastMessageText = 'メッセージが削除されました'
    } else if (conv.latestMessage.image_url !== null) {
      lastMessageText = '\uD83D\uDCF7 画像'
    } else {
      lastMessageText = conv.latestMessage.content ?? ''
    }
  }

  // Time formatting
  const timeText =
    conv.latestMessage !== null ? formatRelativeTime(conv.latestMessage.created_at) : ''

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50"
    >
      {/* Avatar */}
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
        style={{ backgroundColor: avatarColor }}
      >
        {avatarText}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="truncate font-bold text-gray-800">{displayName}</p>
          <span className="shrink-0 text-xs text-gray-400">{timeText}</span>
        </div>
        <div className="mt-0.5 flex items-center justify-between">
          <p className="truncate text-sm text-gray-500">{lastMessageText}</p>
          {conv.unreadCount > 0 && (
            <span className="ml-2 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 px-1.5 text-xs font-bold text-white">
              {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

const TZ = 'Asia/Tokyo'

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const tokyoNow = new Date(now.toLocaleString('en-US', { timeZone: TZ }))
  const tokyoDate = new Date(date.toLocaleString('en-US', { timeZone: TZ }))
  const todayStart = new Date(tokyoNow.getFullYear(), tokyoNow.getMonth(), tokyoNow.getDate())
  const yesterdayStart = new Date(todayStart.getTime() - 86400000)

  if (tokyoDate >= todayStart) {
    return date.toLocaleTimeString('ja-JP', {
      timeZone: TZ,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }
  if (tokyoDate >= yesterdayStart) {
    return '昨日'
  }
  return date.toLocaleDateString('ja-JP', {
    timeZone: TZ,
    month: 'numeric',
    day: 'numeric',
  })
}

/**
 * New chat modal - select a friend to start conversation
 */
function NewChatModal({
  userId,
  onClose,
  onSelect,
  onGroupCreate,
}: {
  readonly userId: string
  readonly onClose: () => void
  readonly onSelect: (conversationId: string) => void
  readonly onGroupCreate: () => void
}) {
  const [friends, setFriends] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadFriends() {
      try {
        const data = await getFriends(userId)
        if (isMounted) setFriends(data)
      } catch {
        // Silent fail
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadFriends()
    return () => {
      isMounted = false
    }
  }, [userId])

  async function handleSelectFriend(friendId: string) {
    if (isCreating) return
    setIsCreating(true)
    try {
      const conversation = await createDirectConversation(userId, friendId)
      onSelect(conversation.id)
    } catch {
      setIsCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-t-2xl bg-white pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="font-bold text-gray-800">新しいトーク</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-gray-600"
          >
            {'\u00D7'}
          </button>
        </div>

        {/* Group create button */}
        <button
          type="button"
          onClick={onGroupCreate}
          className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500 text-lg text-white">
            {'\uD83D\uDC65'}
          </div>
          <span className="font-medium text-gray-800">
            {'\u30B0\u30EB\u30FC\u30D7\u3092\u4F5C\u6210'}
          </span>
        </button>

        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        )}

        {!isLoading && friends.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-500">
            {'\u30D5\u30EC\u30F3\u30C9\u304C\u3044\u307E\u305B\u3093'}
          </div>
        )}

        <div className="max-h-80 overflow-y-auto">
          {friends.map((friend) => (
            <button
              key={friend.id}
              type="button"
              onClick={() => {
                void handleSelectFriend(friend.id)
              }}
              disabled={isCreating}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: friend.avatar_color }}
              >
                {friend.avatar_text}
              </div>
              <span className="font-medium text-gray-800">{friend.display_name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function SearchHeaderIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  )
}

function NewChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 2C5.58 2 2 5.36 2 9.5C2 11.54 2.95 13.36 4.5 14.63V18L7.74 16.26C8.47 16.42 9.23 16.5 10 16.5C14.42 16.5 18 13.14 18 9.5C18 5.86 14.42 2.5 10 2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M10 6V13M6.5 9.5H13.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
