'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthContext, deleteMessage } from '@/features/messenger'
import type { Conversation, Message } from '@/features/messenger'

// ---- Types ----

interface AdminStats {
  readonly userCount: number
  readonly conversationCount: number
  readonly messageCount: number
}

interface ConversationWithMembers {
  readonly conversation: Conversation
  readonly memberCount: number
  readonly memberNames: readonly string[]
}

interface MessageWithSender {
  readonly message: Message
  readonly senderName: string
}

// ---- Data fetching functions (module-level) ----

async function fetchAdminStatus(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single()

  if (error) return false
  return (data as { is_admin: boolean }).is_admin === true
}

async function fetchStats(): Promise<AdminStats> {
  const [usersResult, conversationsResult, messagesResult] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('conversations').select('id', { count: 'exact', head: true }),
    supabase.from('messages').select('id', { count: 'exact', head: true }),
  ])

  return {
    userCount: usersResult.count ?? 0,
    conversationCount: conversationsResult.count ?? 0,
    messageCount: messagesResult.count ?? 0,
  }
}

async function fetchConversations(): Promise<ConversationWithMembers[]> {
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) return []

  const results: ConversationWithMembers[] = []

  for (const conv of conversations) {
    const { data: members } = await supabase
      .from('conversation_members')
      .select('user_id, profile:profiles(display_name)')
      .eq('conversation_id', conv.id)

    const memberCount = members?.length ?? 0
    const memberNames = (members ?? []).map((m) => {
      const profile = (m as Record<string, unknown>).profile as { display_name: string } | null
      return profile?.display_name ?? 'Unknown'
    })

    results.push({
      conversation: conv as Conversation,
      memberCount,
      memberNames,
    })
  }

  return results
}

async function fetchMessagesForConversation(conversationId: string): Promise<MessageWithSender[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:profiles!messages_sender_id_fkey(display_name)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) return []

  return data.map((row) => {
    const sender = (row as Record<string, unknown>).sender as { display_name: string } | null
    return {
      message: {
        id: row.id as string,
        conversation_id: row.conversation_id as string,
        sender_id: row.sender_id as string,
        content: row.content as string | null,
        image_url: row.image_url as string | null,
        reply_to_id: row.reply_to_id as string | null,
        is_deleted: row.is_deleted as boolean,
        created_at: row.created_at as string,
      },
      senderName: sender?.display_name ?? 'Unknown',
    }
  })
}

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

// ---- Sub-components (module-level to avoid nesting) ----

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
    </div>
  )
}

function AccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="mx-4 rounded-xl bg-white p-8 text-center shadow-lg">
        <p className="mb-2 text-4xl">{'\uD83D\uDEAB'}</p>
        <h1 className="mb-2 text-xl font-bold text-gray-800">Access Denied</h1>
        <p className="text-gray-500">
          {
            '\u3053\u306E\u30DA\u30FC\u30B8\u306B\u30A2\u30AF\u30BB\u30B9\u3059\u308B\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093'
          }
        </p>
      </div>
    </div>
  )
}

function StatsCard({
  label,
  value,
  icon,
}: {
  readonly label: string
  readonly value: number
  readonly icon: string
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  )
}

function DashboardHeader({ stats }: { readonly stats: AdminStats }) {
  return (
    <div className="mb-6">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">{'\u7BA1\u7406\u30D1\u30CD\u30EB'}</h1>
      <div className="grid grid-cols-3 gap-3">
        <StatsCard
          label={'\u30E6\u30FC\u30B6\u30FC'}
          value={stats.userCount}
          icon={'\uD83D\uDC64'}
        />
        <StatsCard label={'\u4F1A\u8A71'} value={stats.conversationCount} icon={'\uD83D\uDCAC'} />
        <StatsCard
          label={'\u30E1\u30C3\u30BB\u30FC\u30B8'}
          value={stats.messageCount}
          icon={'\u2709\uFE0F'}
        />
      </div>
    </div>
  )
}

function ConversationListItem({
  item,
  isSelected,
  onSelect,
}: {
  readonly item: ConversationWithMembers
  readonly isSelected: boolean
  readonly onSelect: () => void
}) {
  const conv = item.conversation
  const displayName =
    conv.type === 'group' ? (conv.name ?? '\u30B0\u30EB\u30FC\u30D7') : item.memberNames.join(', ')
  const typeLabel = conv.type === 'group' ? 'Group' : 'DM'

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors ${
        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
          conv.type === 'group' ? 'bg-green-500' : 'bg-blue-500'
        }`}
      >
        {conv.type === 'group' ? '\uD83D\uDC65' : '\uD83D\uDCE8'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium text-gray-800">{displayName}</p>
          <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
            {typeLabel}
          </span>
        </div>
        <p className="text-xs text-gray-400">
          {item.memberCount}
          {'\u4EBA\u306E\u30E1\u30F3\u30D0\u30FC'}
        </p>
      </div>
    </button>
  )
}

function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: {
  readonly conversations: readonly ConversationWithMembers[]
  readonly selectedId: string | null
  readonly onSelect: (id: string) => void
}) {
  return (
    <div className="rounded-xl bg-white shadow-sm">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="font-bold text-gray-800">
          {'\u4F1A\u8A71\u4E00\u89A7'}
          <span className="ml-2 text-sm font-normal text-gray-400">({conversations.length})</span>
        </h2>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {conversations.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">
            {'\u4F1A\u8A71\u304C\u3042\u308A\u307E\u305B\u3093'}
          </p>
        )}
        {conversations.map((item) => (
          <ConversationListItem
            key={item.conversation.id}
            item={item}
            isSelected={selectedId === item.conversation.id}
            onSelect={() => onSelect(item.conversation.id)}
          />
        ))}
      </div>
    </div>
  )
}

function MessageRow({
  item,
  isDeleting,
  onDelete,
}: {
  readonly item: MessageWithSender
  readonly isDeleting: boolean
  readonly onDelete: () => void
}) {
  const msg = item.message
  const deletedStyle = msg.is_deleted ? 'italic text-gray-400' : 'text-gray-800'

  return (
    <div className="flex items-start gap-3 border-b border-gray-50 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700">{item.senderName}</span>
          <span className="text-[10px] text-gray-400">{formatTimestamp(msg.created_at)}</span>
          {msg.is_deleted && (
            <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-500">
              {'\u524A\u9664\u6E08\u307F'}
            </span>
          )}
        </div>
        <p className={`text-sm ${deletedStyle}`}>
          {msg.is_deleted
            ? '\u30E1\u30C3\u30BB\u30FC\u30B8\u304C\u524A\u9664\u3055\u308C\u307E\u3057\u305F'
            : (msg.content ?? '\uD83D\uDCF7 \u753B\u50CF')}
        </p>
      </div>
      {!msg.is_deleted && (
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="shrink-0 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
        >
          {isDeleting ? '\u524A\u9664\u4E2D...' : '\u524A\u9664'}
        </button>
      )}
    </div>
  )
}

function MessagePanel({
  conversationId,
  messages,
  isLoading,
  deletingId,
  onDelete,
  onClose,
}: {
  readonly conversationId: string
  readonly messages: readonly MessageWithSender[]
  readonly isLoading: boolean
  readonly deletingId: string | null
  readonly onDelete: (messageId: string) => void
  readonly onClose: () => void
}) {
  return (
    <div className="rounded-xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="font-bold text-gray-800">
          {'\u30E1\u30C3\u30BB\u30FC\u30B8'}
          <span className="ml-2 text-sm font-normal text-gray-400">({messages.length})</span>
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-xl text-gray-400 transition-colors hover:text-gray-600"
        >
          {'\u00D7'}
        </button>
      </div>
      <div className="text-xs text-gray-400 px-4 py-1 border-b border-gray-100">
        ID: {conversationId}
      </div>
      <div className="max-h-[28rem] overflow-y-auto">
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        )}
        {!isLoading && messages.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">
            {'\u30E1\u30C3\u30BB\u30FC\u30B8\u304C\u3042\u308A\u307E\u305B\u3093'}
          </p>
        )}
        {!isLoading &&
          messages.map((item) => (
            <MessageRow
              key={item.message.id}
              item={item}
              isDeleting={deletingId === item.message.id}
              onDelete={() => onDelete(item.message.id)}
            />
          ))}
      </div>
    </div>
  )
}

// ---- Main Page Component ----

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuthContext()

  const [isAdmin, setIsAdmin] = useState(false)
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true)
  const [stats, setStats] = useState<AdminStats>({
    userCount: 0,
    conversationCount: 0,
    messageCount: 0,
  })
  const [conversations, setConversations] = useState<ConversationWithMembers[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null)

  // Check admin status
  useEffect(() => {
    if (authLoading) return
    if (user === null) {
      setIsCheckingAdmin(false)
      return
    }

    let isMounted = true

    async function checkAdmin() {
      const adminStatus = await fetchAdminStatus(user?.id ?? '')
      if (isMounted) {
        setIsAdmin(adminStatus)
        setIsCheckingAdmin(false)
      }
    }

    void checkAdmin()
    return () => {
      isMounted = false
    }
  }, [user, authLoading])

  // Load dashboard data
  const loadDashboard = useCallback(async () => {
    const [statsData, conversationsData] = await Promise.all([fetchStats(), fetchConversations()])
    setStats(statsData)
    setConversations(conversationsData)
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    void loadDashboard()
  }, [isAdmin, loadDashboard])

  // Load messages for selected conversation
  useEffect(() => {
    if (selectedConversationId === null) {
      setMessages([])
      return
    }

    let isMounted = true
    setIsLoadingMessages(true)

    async function load() {
      const data = await fetchMessagesForConversation(selectedConversationId ?? '')
      if (isMounted) {
        setMessages(data)
        setIsLoadingMessages(false)
      }
    }

    void load()
    return () => {
      isMounted = false
    }
  }, [selectedConversationId])

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    setDeletingMessageId(messageId)
    try {
      await deleteMessage(messageId)
      setMessages((prev) =>
        prev.map((item) =>
          item.message.id === messageId
            ? {
                ...item,
                message: { ...item.message, is_deleted: true, content: null, image_url: null },
              }
            : item
        )
      )
      setStats((prev) => ({ ...prev }))
    } catch {
      // Silent fail
    } finally {
      setDeletingMessageId(null)
    }
  }, [])

  function handleSelectConversation(id: string) {
    setSelectedConversationId(id)
  }

  function handleCloseMessagePanel() {
    setSelectedConversationId(null)
  }

  // Loading state
  if (authLoading || isCheckingAdmin) {
    return <LoadingSpinner />
  }

  // Access denied
  if (user === null || !isAdmin) {
    return <AccessDenied />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <DashboardHeader stats={stats} />
        <div className="grid gap-6 lg:grid-cols-2">
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversationId}
            onSelect={handleSelectConversation}
          />
          {selectedConversationId !== null && (
            <MessagePanel
              conversationId={selectedConversationId}
              messages={messages}
              isLoading={isLoadingMessages}
              deletingId={deletingMessageId}
              onDelete={(id) => {
                void handleDeleteMessage(id)
              }}
              onClose={handleCloseMessagePanel}
            />
          )}
          {selectedConversationId === null && (
            <div className="flex items-center justify-center rounded-xl bg-white p-12 shadow-sm">
              <div className="text-center">
                <p className="mb-2 text-3xl">{'\uD83D\uDCC2'}</p>
                <p className="text-sm text-gray-400">
                  {
                    '\u4F1A\u8A71\u3092\u9078\u629E\u3057\u3066\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u8868\u793A'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
