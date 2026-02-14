'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import {
  useAuthContext,
  getConversation,
  getMessages,
  sendMessage,
  deleteMessage,
  markAsRead,
  uploadImage,
  addReaction,
  removeReaction,
  MESSAGE_MAX_LENGTH,
  IMAGE_MAX_SIZE_BYTES,
  ALLOWED_IMAGE_TYPES,
  REACTION_EMOJIS,
  SOUND_SEND,
  SOUND_RECEIVE,
} from '@/features/messenger'
import type {
  Conversation,
  MessageWithDetails,
  Profile,
  ConversationMember,
  ReactionEmoji,
  Message,
} from '@/features/messenger'
import { MESSAGES_PER_PAGE } from '@/features/messenger'

const TZ = 'Asia/Tokyo'
const DAY_NAMES = ['\u65E5', '\u6708', '\u706B', '\u6C34', '\u6728', '\u91D1', '\u571F'] as const
const LONG_PRESS_DURATION = 500

/**
 * Supabase Realtime payload for messages table
 */
interface RealtimeMessagePayload {
  readonly id: string
  readonly conversation_id: string
  readonly sender_id: string
  readonly content: string | null
  readonly image_url: string | null
  readonly reply_to_id: string | null
  readonly is_deleted: boolean
  readonly created_at: string
}

/**
 * Context menu state
 */
interface ContextMenuState {
  readonly messageId: string
  readonly x: number
  readonly y: number
}

// ---- Module-level helper functions (avoid deep nesting) ----

function appendIfNew(prev: MessageWithDetails[], detail: MessageWithDetails): MessageWithDetails[] {
  if (prev.some((m) => m.message.id === detail.message.id)) return prev
  return [...prev, detail]
}

async function buildRealtimeMessage(
  newMsg: RealtimeMessagePayload
): Promise<MessageWithDetails | null> {
  const { data: sender } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', newMsg.sender_id)
    .single()

  if (sender === null) return null

  return {
    message: {
      id: newMsg.id,
      conversation_id: newMsg.conversation_id,
      sender_id: newMsg.sender_id,
      content: newMsg.content,
      image_url: newMsg.image_url,
      reply_to_id: newMsg.reply_to_id,
      is_deleted: newMsg.is_deleted,
      created_at: newMsg.created_at,
    },
    sender: sender as Profile,
    reactions: [],
    replyTo: null,
  }
}

function mergePolledMessages(
  prev: MessageWithDetails[],
  polled: MessageWithDetails[]
): MessageWithDetails[] {
  const existingIds = new Set(prev.map((m) => m.message.id))
  const newMsgs = polled.filter((m) => !existingIds.has(m.message.id))
  const hasUpdates = polled.some((p) => {
    const existing = prev.find((m) => m.message.id === p.message.id)
    return existing !== undefined && existing.message.is_deleted !== p.message.is_deleted
  })
  if (newMsgs.length === 0 && !hasUpdates) return prev
  if (hasUpdates) {
    const updated = prev.map((m) => {
      const match = polled.find((d) => d.message.id === m.message.id)
      return match ?? m
    })
    return [...updated, ...newMsgs]
  }
  return [...prev, ...newMsgs]
}

function applyMessageUpdate(
  messages: MessageWithDetails[],
  updated: RealtimeMessagePayload
): MessageWithDetails[] {
  return messages.map((m) =>
    m.message.id === updated.id
      ? {
          ...m,
          message: {
            ...m.message,
            content: updated.content,
            image_url: updated.image_url,
            is_deleted: updated.is_deleted,
          },
        }
      : m
  )
}

async function loadMembers(
  conversationId: string
): Promise<(ConversationMember & { profile: Profile })[]> {
  const { data } = await supabase
    .from('conversation_members')
    .select('*, profile:profiles(*)')
    .eq('conversation_id', conversationId)

  if (data === null) return []

  return data.map((m) => ({
    ...(m as unknown as ConversationMember),
    profile: (m as Record<string, unknown>).profile as Profile,
  }))
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('ja-JP', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function formatDateSeparatorText(dateStr: string): string {
  const date = new Date(dateStr)
  const formatted = date.toLocaleDateString('ja-JP', {
    timeZone: TZ,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const tokyoDate = new Date(date.toLocaleString('en-US', { timeZone: TZ }))
  const dayName = DAY_NAMES[tokyoDate.getDay()]
  return `${formatted}(${dayName})`
}

function isSameDay(dateStr1: string, dateStr2: string): boolean {
  const d1 = new Date(new Date(dateStr1).toLocaleString('en-US', { timeZone: TZ }))
  const d2 = new Date(new Date(dateStr2).toLocaleString('en-US', { timeZone: TZ }))
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

function playSound(src: string): void {
  try {
    const audio = new Audio(src)
    audio.play().catch(() => undefined)
  } catch {
    // Silent fail - sounds are non-critical
  }
}

function hasUserReacted(
  reactions: readonly { readonly user_id: string; readonly emoji: string }[],
  userId: string,
  emoji: string
): boolean {
  return reactions.some((r) => r.user_id === userId && r.emoji === emoji)
}

function countReactionsByEmoji(
  reactions: readonly { readonly emoji: string }[],
  emoji: string
): number {
  return reactions.filter((r) => r.emoji === emoji).length
}

// ---- Main Page Component ----

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthContext()
  const conversationId = typeof params.conversationId === 'string' ? params.conversationId : ''

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [members, setMembers] = useState<(ConversationMember & { profile: Profile })[]>([])
  const [messages, setMessages] = useState<MessageWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [inputText, setInputText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [replyTo, setReplyTo] = useState<MessageWithDetails | null>(null)
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const isLoadingMore = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Close context menu on any click
  useEffect(() => {
    if (contextMenu === null) return

    function handleClick() {
      setContextMenu(null)
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [contextMenu])

  // Initial load
  useEffect(() => {
    if (conversationId === '' || user === null) return

    let isMounted = true

    async function load() {
      try {
        const cid = conversationId
        const [conv, msgs, membersData] = await Promise.all([
          getConversation(cid),
          getMessages(cid),
          loadMembers(cid),
        ])

        if (!isMounted) return

        setConversation(conv)
        setMessages(msgs)
        setMembers(membersData)
        setHasMore(msgs.length >= MESSAGES_PER_PAGE)

        if (user !== null) {
          void markAsRead(conversationId, user.id)
        }
      } catch {
        // Silent fail
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void load()
    return () => {
      isMounted = false
    }
  }, [conversationId, user])

  // Scroll to bottom on initial load and new messages
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isLoading, messages.length])

  // Realtime subscription
  useEffect(() => {
    if (conversationId === '' || user === null) return

    const currentUserId = user.id
    const cid = conversationId

    function appendMessage(detail: MessageWithDetails | null, senderId: string) {
      if (detail === null) return
      setMessages((prev) => appendIfNew(prev, detail))
      if (senderId !== currentUserId) {
        void markAsRead(cid, currentUserId)
        playSound(SOUND_RECEIVE)
      }
    }

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new as RealtimeMessagePayload
          void buildRealtimeMessage(msg).then((d) => appendMessage(d, msg.sender_id))
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) =>
          setMessages((prev) => applyMessageUpdate(prev, payload.new as RealtimeMessagePayload))
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
        },
        () => {
          void getMessages(conversationId)
            .then((data) => setMessages(data))
            .catch(() => undefined)
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [conversationId, user])

  // Polling fallback for iOS WebSocket drops + visibility change handler
  useEffect(() => {
    if (conversationId === '' || user === null || isLoading) return

    const cid = conversationId
    const uid = user.id

    async function poll() {
      try {
        const data = await getMessages(cid)
        setMessages((prev) => mergePolledMessages(prev, data))
        void markAsRead(cid, uid)
      } catch {
        // Silent fail
      }
    }

    function onVisible() {
      if (document.visibilityState === 'visible') void poll()
    }

    document.addEventListener('visibilitychange', onVisible)
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') void poll()
    }, 3000)

    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      clearInterval(timer)
    }
  }, [conversationId, user, isLoading])

  // Load more messages (scroll up)
  const handleLoadMore = useCallback(() => {
    if (isLoadingMore.current || !hasMore || messages.length === 0) return
    isLoadingMore.current = true

    const cursor = messages[0].message.created_at

    void getMessages(conversationId, cursor)
      .then((older) => {
        setMessages((prev) => [...older, ...prev])
        setHasMore(older.length >= MESSAGES_PER_PAGE)
      })
      .catch(() => undefined)
      .finally(() => {
        isLoadingMore.current = false
      })
  }, [conversationId, hasMore, messages])

  // Send text message
  async function handleSend() {
    if (user === null || isSending) return
    if (inputText.trim() === '') return

    const text = inputText.trim()
    const replyId = replyTo?.message.id
    setInputText('')
    setReplyTo(null)
    setIsSending(true)

    try {
      await sendMessage(conversationId, user.id, text, undefined, replyId)
      playSound(SOUND_SEND)
    } catch {
      setInputText(text)
    } finally {
      setIsSending(false)
    }
  }

  // Send image
  async function handleImageSelect(file: File) {
    if (user === null || isUploading) return

    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      return
    }
    if (file.size > IMAGE_MAX_SIZE_BYTES) {
      return
    }

    setIsUploading(true)
    try {
      const imageUrl = await uploadImage(file, user.id)
      await sendMessage(conversationId, user.id, undefined, imageUrl)
      playSound(SOUND_SEND)
    } catch {
      // Silent fail
    } finally {
      setIsUploading(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      void handleImageSelect(file)
    }
    e.target.value = ''
  }

  // Handle Enter key
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  // Context menu handlers
  function handleContextMenuOpen(messageId: string, x: number, y: number) {
    setContextMenu({ messageId, x, y })
  }

  function handleReply(msg: MessageWithDetails) {
    setReplyTo(msg)
    setContextMenu(null)
  }

  async function handleDelete(messageId: string) {
    setContextMenu(null)
    try {
      await deleteMessage(messageId)
    } catch {
      // Silent fail
    }
  }

  async function handleReaction(messageId: string, emoji: ReactionEmoji) {
    if (user === null) return
    setContextMenu(null)

    const targetMsg = messages.find((m) => m.message.id === messageId)
    if (!targetMsg) return

    const alreadyReacted = hasUserReacted(targetMsg.reactions, user.id, emoji)

    try {
      if (alreadyReacted) {
        await removeReaction(messageId, user.id, emoji)
      } else {
        await addReaction(messageId, user.id, emoji)
      }
    } catch {
      // Silent fail
    }
  }

  // Long press handlers
  function handleLongPressStart(messageId: string, clientX: number, clientY: number) {
    longPressTimer.current = setTimeout(() => {
      handleContextMenuOpen(messageId, clientX, clientY)
    }, LONG_PRESS_DURATION)
  }

  function handleLongPressEnd() {
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  if (user === null) return null

  // Determine conversation display name
  const otherMember = members.find((m) => m.user_id !== user.id)
  const displayName =
    conversation?.type === 'group'
      ? (conversation.name ?? '\u30B0\u30EB\u30FC\u30D7')
      : (otherMember?.profile.display_name ?? '\u30C8\u30FC\u30AF')

  const currentUserId = user.id

  return (
    <div className="flex h-screen flex-col bg-[#8CABD9]">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 bg-white px-4 py-3 shadow-sm">
        <button type="button" onClick={() => router.push('/m')} className="text-xl text-gray-600">
          {'\u2190'}
        </button>
        <h1 className="flex-1 truncate font-bold text-gray-800">{displayName}</h1>
        {conversation?.type === 'group' && (
          <button
            type="button"
            onClick={() => router.push(`/m/chat/${conversationId}/settings`)}
            className="text-gray-500 hover:text-gray-700"
          >
            <SettingsIcon />
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-3 py-4">
        {/* Load more button */}
        {hasMore && !isLoading && (
          <div className="mb-4 text-center">
            <button
              type="button"
              onClick={handleLoadMore}
              className="rounded-full bg-white/50 px-4 py-1 text-xs text-gray-600"
            >
              {'\u3082\u3063\u3068\u8AAD\u307F\u8FBC\u3080'}
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-white/70">
              {'\u30E1\u30C3\u30BB\u30FC\u30B8\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093'}
            </p>
          </div>
        )}

        {messages.map((msg, index) => {
          const prevMsg = index > 0 ? messages[index - 1] : null
          const showDateSeparator =
            prevMsg === null || !isSameDay(prevMsg.message.created_at, msg.message.created_at)

          return (
            <div key={msg.message.id}>
              {showDateSeparator && <DateSeparator dateStr={msg.message.created_at} />}
              <MessageBubble
                message={msg}
                isOwn={msg.message.sender_id === currentUserId}
                currentUserId={currentUserId}
                onContextMenu={handleContextMenuOpen}
                onLongPressStart={handleLongPressStart}
                onLongPressEnd={handleLongPressEnd}
                onImageClick={setImagePreview}
                onReaction={handleReaction}
              />
            </div>
          )
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Reply bar */}
      {replyTo !== null && <ReplyBar replyTo={replyTo} onCancel={() => setReplyTo(null)} />}

      {/* Input bar */}
      <div className="shrink-0 border-t border-gray-200 bg-white px-3 py-2">
        <div className="flex items-end gap-2">
          {/* Image button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-50"
          >
            {isUploading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
            ) : (
              <ImageIcon />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={'\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u5165\u529B'}
            maxLength={MESSAGE_MAX_LENGTH}
            rows={1}
            className="max-h-24 min-h-10 flex-1 resize-none rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              void handleSend()
            }}
            disabled={inputText.trim() === '' || isSending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300"
          >
            <SendIcon />
          </button>
        </div>
      </div>

      {/* Context menu */}
      {contextMenu !== null && (
        <FloatingContextMenu
          menu={contextMenu}
          messages={messages}
          currentUserId={currentUserId}
          onReply={handleReply}
          onDelete={handleDelete}
          onReaction={handleReaction}
        />
      )}

      {/* Image preview modal */}
      {imagePreview !== null && (
        <ImagePreviewModal imageUrl={imagePreview} onClose={() => setImagePreview(null)} />
      )}
    </div>
  )
}

// ---- Sub Components (kept flat to avoid nesting issues) ----

function MessageBubble({
  message: msg,
  isOwn,
  currentUserId,
  onContextMenu,
  onLongPressStart,
  onLongPressEnd,
  onImageClick,
  onReaction,
}: {
  readonly message: MessageWithDetails
  readonly isOwn: boolean
  readonly currentUserId: string
  readonly onContextMenu: (messageId: string, x: number, y: number) => void
  readonly onLongPressStart: (messageId: string, x: number, y: number) => void
  readonly onLongPressEnd: () => void
  readonly onImageClick: (url: string) => void
  readonly onReaction: (messageId: string, emoji: ReactionEmoji) => Promise<void>
}) {
  if (msg.message.is_deleted) {
    return (
      <div className={`mb-2 flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div className="rounded-xl bg-gray-200/50 px-3 py-2 text-xs italic text-gray-400">
          {'\u30E1\u30C3\u30BB\u30FC\u30B8\u304C\u524A\u9664\u3055\u308C\u307E\u3057\u305F'}
        </div>
      </div>
    )
  }

  const time = formatMessageTime(msg.message.created_at)
  const messageId = msg.message.id

  function handleRightClick(e: React.MouseEvent) {
    e.preventDefault()
    onContextMenu(messageId, e.clientX, e.clientY)
  }

  function handleTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0]
    onLongPressStart(messageId, touch.clientX, touch.clientY)
  }

  return (
    <div className={`mb-2 flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {/* Other user's avatar */}
      {!isOwn && (
        <div
          className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center self-end rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: msg.sender.avatar_color }}
        >
          {msg.sender.avatar_text}
        </div>
      )}

      <div className={`flex max-w-[70%] flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender name */}
        {!isOwn && (
          <span className="mb-0.5 ml-1 text-xs text-white/80">{msg.sender.display_name}</span>
        )}

        <div className={`flex items-end gap-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Bubble */}
          <div
            className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
              isOwn ? 'bg-[#A8D97A] text-gray-800' : 'bg-white text-gray-800'
            }`}
            onContextMenu={handleRightClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={onLongPressEnd}
            onTouchMove={onLongPressEnd}
          >
            {/* Reply-to preview */}
            {msg.replyTo !== null && <ReplyToPreview replyTo={msg.replyTo} />}

            {/* Image */}
            {msg.message.image_url !== null && (
              <MessageImage imageUrl={msg.message.image_url} onImageClick={onImageClick} />
            )}

            {/* Text content */}
            {msg.message.content !== null && <span>{msg.message.content}</span>}
          </div>

          {/* Time + read receipt */}
          <div className={`flex shrink-0 flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
            {isOwn && <span className="text-[10px] text-white/70">{'\u65E2\u8AAD'}</span>}
            <span className="text-[10px] text-white/60">{time}</span>
          </div>
        </div>

        {/* Reactions */}
        {msg.reactions.length > 0 && (
          <ReactionsDisplay
            reactions={msg.reactions}
            messageId={messageId}
            currentUserId={currentUserId}
            onReaction={onReaction}
          />
        )}
      </div>
    </div>
  )
}

function ReplyToPreview({ replyTo }: { readonly replyTo: Message & { readonly sender: Profile } }) {
  return (
    <div className="mb-1 border-l-2 border-blue-400 pl-2">
      <p className="text-[10px] font-bold text-blue-600">{replyTo.sender.display_name}</p>
      <p className="truncate text-xs text-gray-500">
        {replyTo.is_deleted
          ? '\u524A\u9664\u3055\u308C\u305F\u30E1\u30C3\u30BB\u30FC\u30B8'
          : (replyTo.content ?? '\uD83D\uDCF7 \u753B\u50CF')}
      </p>
    </div>
  )
}

function ReactionsDisplay({
  reactions,
  messageId,
  currentUserId,
  onReaction,
}: {
  readonly reactions: readonly { readonly emoji: string; readonly user_id: string }[]
  readonly messageId: string
  readonly currentUserId: string
  readonly onReaction: (messageId: string, emoji: ReactionEmoji) => Promise<void>
}) {
  return (
    <div className="mt-0.5 flex gap-1">
      {REACTION_EMOJIS.map((emoji) => {
        const count = countReactionsByEmoji(reactions, emoji)
        if (count === 0) return null
        const isActive = hasUserReacted(reactions, currentUserId, emoji)
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => {
              void onReaction(messageId, emoji)
            }}
            className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs transition-colors ${
              isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{emoji}</span>
            <span>{count}</span>
          </button>
        )
      })}
    </div>
  )
}

function DateSeparator({ dateStr }: { readonly dateStr: string }) {
  const formatted = formatDateSeparatorText(dateStr)
  return (
    <div className="my-4 flex items-center justify-center">
      <span className="rounded-full bg-black/20 px-3 py-1 text-xs text-white">{formatted}</span>
    </div>
  )
}

function ReplyBar({
  replyTo,
  onCancel,
}: {
  readonly replyTo: MessageWithDetails
  readonly onCancel: () => void
}) {
  return (
    <div className="flex items-center gap-2 border-t border-gray-200 bg-gray-50 px-4 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-blue-600">{replyTo.sender.display_name}</p>
        <p className="truncate text-xs text-gray-500">
          {replyTo.message.content ?? '\uD83D\uDCF7 \u753B\u50CF'}
        </p>
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="shrink-0 text-lg text-gray-400 hover:text-gray-600"
      >
        {'\u00D7'}
      </button>
    </div>
  )
}

function FloatingContextMenu({
  menu,
  messages,
  currentUserId,
  onReply,
  onDelete,
  onReaction,
}: {
  readonly menu: ContextMenuState
  readonly messages: readonly MessageWithDetails[]
  readonly currentUserId: string
  readonly onReply: (msg: MessageWithDetails) => void
  readonly onDelete: (messageId: string) => Promise<void>
  readonly onReaction: (messageId: string, emoji: ReactionEmoji) => Promise<void>
}) {
  const targetMsg = messages.find((m) => m.message.id === menu.messageId)
  if (!targetMsg) return null
  if (targetMsg.message.is_deleted) return null

  // Adjust menu position to stay within viewport
  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(menu.x, window.innerWidth - 200),
    top: Math.min(menu.y, window.innerHeight - 200),
    zIndex: 100,
  }

  return (
    <div
      style={menuStyle}
      className="min-w-44 rounded-xl bg-white py-1 shadow-xl ring-1 ring-black/10"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Reactions row */}
      <div className="flex justify-center gap-3 border-b border-gray-100 px-4 py-2">
        {REACTION_EMOJIS.map((emoji) => {
          const isActive = hasUserReacted(targetMsg.reactions, currentUserId, emoji)
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                void onReaction(menu.messageId, emoji)
              }}
              className={`rounded-full p-1.5 text-xl transition-colors ${
                isActive ? 'bg-blue-100' : 'hover:bg-gray-100'
              }`}
            >
              {emoji}
            </button>
          )
        })}
      </div>

      {/* Reply */}
      <button
        type="button"
        onClick={() => onReply(targetMsg)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
      >
        <span className="text-base">{'\u21A9\uFE0F'}</span>
        <span>{'\u8FD4\u4FE1'}</span>
      </button>

      {/* Delete */}
      <button
        type="button"
        onClick={() => {
          void onDelete(menu.messageId)
        }}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
      >
        <span className="text-base">{'\uD83D\uDDD1\uFE0F'}</span>
        <span>{'\u524A\u9664'}</span>
      </button>
    </div>
  )
}

function ImagePreviewModal({
  imageUrl,
  onClose,
}: {
  readonly imageUrl: string
  readonly onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 text-3xl text-white"
      >
        {'\u00D7'}
      </button>
      <button
        type="button"
        className="relative max-h-[90vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={imageUrl}
          alt=""
          width={800}
          height={600}
          className="max-h-[90vh] max-w-[90vw] object-contain"
        />
      </button>
    </div>
  )
}

function MessageImage({
  imageUrl,
  onImageClick,
}: {
  readonly imageUrl: string
  readonly onImageClick: (url: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onImageClick(imageUrl)}
      className="mb-1 block overflow-hidden rounded-lg"
    >
      <Image
        src={imageUrl}
        alt=""
        width={300}
        height={200}
        className="max-h-48 max-w-full rounded-lg object-cover"
      />
    </button>
  )
}

// ---- Icon Components ----

function SendIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  )
}

function ImageIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  )
}
