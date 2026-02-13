'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { getConversations } from '../api/conversations'
import type { ConversationWithDetails } from '../types'

interface UseConversationsReturn {
  readonly conversations: readonly ConversationWithDetails[]
  readonly isLoading: boolean
  readonly error: string | null
  readonly refresh: () => void
}

export function useConversations(userId: string | null): UseConversationsReturn {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const refreshCountRef = useRef(0)

  const fetchConversations = useCallback(async (uid: string) => {
    try {
      const data = await getConversations(uid)
      setConversations(data)
      setError(null)
    } catch {
      setError('会話の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    if (userId === null) {
      setIsLoading(false)
      return
    }

    void fetchConversations(userId)
  }, [userId, fetchConversations])

  // Subscribe to realtime changes
  useEffect(() => {
    if (userId === null) return

    const channel = supabase
      .channel('conversations-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        // New message in any conversation → refresh list
        void fetchConversations(userId)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversations' }, () => {
        void fetchConversations(userId)
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [userId, fetchConversations])

  const refresh = useCallback(() => {
    if (userId === null) return
    refreshCountRef.current += 1
    setIsLoading(true)
    void fetchConversations(userId)
  }, [userId, fetchConversations])

  return { conversations, isLoading, error, refresh }
}
