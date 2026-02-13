/**
 * メッセージAPI関数
 */

import { supabase } from '@/lib/supabase'
import type { Message, MessageWithDetails, Profile, MessageReaction } from '../types'
import { MESSAGES_PER_PAGE } from '../constants'

/**
 * Supabaseのメッセージ取得結果の型
 */
interface MessageQueryResult {
  readonly id: string
  readonly conversation_id: string
  readonly sender_id: string
  readonly content: string | null
  readonly image_url: string | null
  readonly reply_to_id: string | null
  readonly is_deleted: boolean
  readonly created_at: string
  readonly sender: Profile
  readonly reactions: (MessageReaction & { readonly user: Profile })[]
}

/**
 * 返信先メッセージを取得（self-referencing FKはPostgREST非対応のため別クエリ）
 */
async function fetchReplyMessages(
  replyToIds: string[]
): Promise<Map<string, Message & { sender: Profile }>> {
  if (replyToIds.length === 0) return new Map()

  const { data } = await supabase
    .from('messages')
    .select('*, sender:profiles!messages_sender_id_fkey(*)')
    .in('id', replyToIds)

  const map = new Map<string, Message & { sender: Profile }>()
  if (data !== null) {
    for (const msg of data) {
      const typed = msg as unknown as Message & { sender: Profile }
      map.set(typed.id, typed)
    }
  }
  return map
}

/**
 * 会話のメッセージ一覧を取得
 */
export async function getMessages(
  conversationId: string,
  cursor?: string
): Promise<MessageWithDetails[]> {
  let query = supabase
    .from('messages')
    .select(
      `
      *,
      sender:profiles!messages_sender_id_fkey(*),
      reactions:message_reactions(*, user:profiles!message_reactions_user_id_fkey(*))
    `
    )
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(MESSAGES_PER_PAGE)

  if (cursor !== undefined) {
    query = query.lt('created_at', cursor)
  }

  const { data, error } = await query

  if (error) {
    throw new Error('メッセージの取得に失敗しました')
  }

  const typedData = data as unknown as MessageQueryResult[]

  // Fetch reply-to messages separately
  const replyToIds = typedData
    .map((msg) => msg.reply_to_id)
    .filter((id): id is string => id !== null)
  const replyMap = await fetchReplyMessages(replyToIds)

  return typedData
    .map((msg) => ({
      message: {
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        content: msg.content,
        image_url: msg.image_url,
        reply_to_id: msg.reply_to_id,
        is_deleted: msg.is_deleted,
        created_at: msg.created_at,
      },
      sender: msg.sender,
      reactions: msg.reactions,
      replyTo: msg.reply_to_id !== null ? (replyMap.get(msg.reply_to_id) ?? null) : null,
    }))
    .reverse() // 時系列順にソート
}

/**
 * メッセージを送信
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content?: string,
  imageUrl?: string,
  replyToId?: string
): Promise<Message> {
  const insertData: {
    conversation_id: string
    sender_id: string
    content?: string
    image_url?: string
    reply_to_id?: string
  } = {
    conversation_id: conversationId,
    sender_id: senderId,
  }

  if (content !== undefined && content.trim() !== '') {
    insertData.content = content.trim()
  }
  if (imageUrl !== undefined) {
    insertData.image_url = imageUrl
  }
  if (replyToId !== undefined) {
    insertData.reply_to_id = replyToId
  }

  const { data, error } = await supabase.from('messages').insert(insertData).select('*').single()

  if (error) {
    throw new Error('メッセージの送信に失敗しました')
  }

  // 会話のupdated_atを更新
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)

  return data
}

/**
 * メッセージを削除（論理削除）
 */
export async function deleteMessage(messageId: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update({ is_deleted: true, content: null, image_url: null })
    .eq('id', messageId)

  if (error) {
    throw new Error('メッセージの削除に失敗しました')
  }
}

/**
 * 既読を更新
 */
export async function markAsRead(conversationId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('conversation_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)

  if (error) {
    throw new Error('既読の更新に失敗しました')
  }
}
