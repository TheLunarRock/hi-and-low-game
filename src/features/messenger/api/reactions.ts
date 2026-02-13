/**
 * リアクションAPI関数
 */

import { supabase } from '@/lib/supabase'
import type { MessageReaction, ReactionEmoji } from '../types'

/**
 * リアクションを追加
 */
export async function addReaction(
  messageId: string,
  userId: string,
  emoji: ReactionEmoji
): Promise<MessageReaction> {
  const { data, error } = await supabase
    .from('message_reactions')
    .insert({
      message_id: messageId,
      user_id: userId,
      emoji,
    })
    .select('*')
    .single()

  if (error) {
    throw new Error('リアクションの追加に失敗しました')
  }

  return data
}

/**
 * リアクションを削除
 */
export async function removeReaction(
  messageId: string,
  userId: string,
  emoji: ReactionEmoji
): Promise<void> {
  const { error } = await supabase
    .from('message_reactions')
    .delete()
    .eq('message_id', messageId)
    .eq('user_id', userId)
    .eq('emoji', emoji)

  if (error) {
    throw new Error('リアクションの削除に失敗しました')
  }
}
