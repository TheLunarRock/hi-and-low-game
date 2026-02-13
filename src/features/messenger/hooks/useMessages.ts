'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { getMessages, sendMessage, markAsRead } from '../api/messages'
import type { MessageWithDetails, Profile } from '../types'
import { MESSAGES_PER_PAGE } from '../constants'

interface UseMessagesReturn {
  readonly messages: readonly MessageWithDetails[]
  readonly isLoading: boolean
  readonly error: string | null
  readonly hasMore: boolean
  readonly loadMore: () => void
  readonly send: (content?: string, imageUrl?: string, replyToId?: string) => Promise<void>
}

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

function appendIfNewMsg(
  prev: MessageWithDetails[],
  detail: MessageWithDetails
): MessageWithDetails[] {
  if (prev.some((m) => m.message.id === detail.message.id)) return prev
  return [...prev, detail]
}

async function buildRealtimeMsg(
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

function applyMsgUpdate(
  msgs: MessageWithDetails[],
  updated: RealtimeMessagePayload
): MessageWithDetails[] {
  return msgs.map((m) =>
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

export function useMessages(
  conversationId: string | null,
  userId: string | null
): UseMessagesReturn {
  const [messages, setMessages] = useState<MessageWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const isLoadingMore = useRef(false)

  // Initial load
  useEffect(() => {
    if (conversationId === null || userId === null) {
      setIsLoading(false)
      return
    }

    let isMounted = true

    async function load() {
      try {
        if (conversationId === null) return
        const data = await getMessages(conversationId)
        if (isMounted) {
          setMessages(data)
          setHasMore(data.length >= MESSAGES_PER_PAGE)
          setError(null)
        }
      } catch {
        if (isMounted) {
          setError('メッセージの取得に失敗しました')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void load()

    // Mark as read
    void markAsRead(conversationId, userId)

    return () => {
      isMounted = false
    }
  }, [conversationId, userId])

  // Subscribe to realtime changes
  useEffect(() => {
    if (conversationId === null || userId === null) return

    const cid = conversationId
    const uid = userId

    function appendMessage(detail: MessageWithDetails | null, senderId: string) {
      if (detail === null) return
      setMessages((prev) => appendIfNewMsg(prev, detail))
      if (senderId !== uid) {
        void markAsRead(cid, uid)
      }
    }

    const channel = supabase
      .channel(`messages-${conversationId}`)
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
          void buildRealtimeMsg(msg).then((d) => appendMessage(d, msg.sender_id))
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
          setMessages((prev) => applyMsgUpdate(prev, payload.new as RealtimeMessagePayload))
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
        },
        () => {
          // Refresh reactions - refetch all messages for simplicity
          void (async () => {
            try {
              const data = await getMessages(conversationId)
              setMessages(data)
            } catch {
              // Silently fail on reaction refresh
            }
          })()
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [conversationId, userId])

  // Load more (older) messages
  const loadMore = useCallback(() => {
    if (conversationId === null || isLoadingMore.current || !hasMore || messages.length === 0) {
      return
    }

    isLoadingMore.current = true
    const oldestMessage = messages[0]
    const cursor = oldestMessage.message.created_at

    void (async () => {
      try {
        const olderMessages = await getMessages(conversationId, cursor)
        setMessages((prev) => [...olderMessages, ...prev])
        setHasMore(olderMessages.length >= MESSAGES_PER_PAGE)
      } catch {
        // Silent fail on load more
      } finally {
        isLoadingMore.current = false
      }
    })()
  }, [conversationId, hasMore, messages])

  // Send message
  const send = useCallback(
    async (content?: string, imageUrl?: string, replyToId?: string) => {
      if (conversationId === null || userId === null) return

      await sendMessage(conversationId, userId, content, imageUrl, replyToId)
    },
    [conversationId, userId]
  )

  return { messages, isLoading, error, hasMore, loadMore, send }
}
