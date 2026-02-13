/**
 * メッセンジャー機能の型定義
 */

import type { Database } from '@/lib/supabase/database.types'

// Database row types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Friendship = Database['public']['Tables']['friendships']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type ConversationMember = Database['public']['Tables']['conversation_members']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type MessageReaction = Database['public']['Tables']['message_reactions']['Row']

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type FriendshipInsert = Database['public']['Tables']['friendships']['Insert']
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert']
export type ConversationMemberInsert =
  Database['public']['Tables']['conversation_members']['Insert']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type MessageReactionInsert = Database['public']['Tables']['message_reactions']['Insert']

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type MessageUpdate = Database['public']['Tables']['messages']['Update']

/**
 * 会話タイプ
 */
export type ConversationType = 'direct' | 'group'

/**
 * リアクション絵文字
 */
export type ReactionEmoji = '\uD83D\uDC4D' | '\u2705'

/**
 * 会話詳細（トーク一覧表示用）
 */
export interface ConversationWithDetails {
  readonly conversation: Conversation
  readonly members: readonly (ConversationMember & { readonly profile: Profile })[]
  readonly latestMessage: Message | null
  readonly unreadCount: number
}

/**
 * メッセージ詳細（チャット表示用）
 */
export interface MessageWithDetails {
  readonly message: Message
  readonly sender: Profile
  readonly reactions: readonly (MessageReaction & { readonly user: Profile })[]
  readonly replyTo: (Message & { readonly sender: Profile }) | null
}

/**
 * 認証状態
 */
export interface AuthState {
  readonly user: Profile | null
  readonly isLoading: boolean
  readonly isAuthenticated: boolean
}

/**
 * サインアップフォームデータ
 */
export interface SignUpFormData {
  readonly email: string
  readonly password: string
  readonly displayName: string
}

/**
 * ログインフォームデータ
 */
export interface LoginFormData {
  readonly email: string
  readonly password: string
}
