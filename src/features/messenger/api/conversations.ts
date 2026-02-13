/**
 * 会話API関数
 */

import { supabase } from '@/lib/supabase'
import type {
  Conversation,
  ConversationWithDetails,
  Profile,
  ConversationMember,
  Message,
} from '../types'
import { CONVERSATIONS_PER_PAGE } from '../constants'

/**
 * ユーザーの会話一覧を取得
 */
export async function getConversations(userId: string): Promise<ConversationWithDetails[]> {
  // ユーザーの会話メンバーシップを取得
  const { data: memberships, error: memberError } = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('user_id', userId)

  if (memberError) {
    throw new Error('会話の取得に失敗しました')
  }

  if (memberships.length === 0) {
    return []
  }

  const conversationIds = memberships.map((m) => m.conversation_id)

  // 会話を取得
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .in('id', conversationIds)
    .order('updated_at', { ascending: false })
    .limit(CONVERSATIONS_PER_PAGE)

  if (convError) {
    throw new Error('会話の取得に失敗しました')
  }

  // 全メンバーとプロフィールを取得
  const { data: allMembers } = await supabase
    .from('conversation_members')
    .select('*, profile:profiles(*)')
    .in('conversation_id', conversationIds)

  // 各会話の詳細を構築
  const results: ConversationWithDetails[] = []

  for (const conv of conversations) {
    const detail = await buildConversationDetail(conv as Conversation, allMembers ?? [], userId)
    results.push(detail)
  }

  return results
}

/**
 * 会話詳細を構築（内部ヘルパー）
 */
async function buildConversationDetail(
  conv: Conversation,
  allMembers: readonly Record<string, unknown>[],
  userId: string
): Promise<ConversationWithDetails> {
  // 最新メッセージを取得
  const { data: latestMessages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conv.id)
    .order('created_at', { ascending: false })
    .limit(1)

  const latestMessage =
    latestMessages !== null && latestMessages.length > 0 ? (latestMessages[0] as Message) : null

  // この会話のメンバーを抽出
  const members = allMembers
    .filter((m) => (m as Record<string, unknown>).conversation_id === conv.id)
    .map((m) => ({
      ...m,
      profile: (m as Record<string, unknown>).profile as unknown as Profile,
    })) as unknown as (ConversationMember & { profile: Profile })[]

  // 未読数を計算
  const myMembership = members.find((m) => m.user_id === userId)
  let unreadCount = 0
  if (myMembership !== undefined && latestMessage !== null) {
    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('conversation_id', conv.id)
      .gt('created_at', myMembership.last_read_at)
      .neq('sender_id', userId)

    unreadCount = count ?? 0
  }

  return {
    conversation: conv,
    members,
    latestMessage,
    unreadCount,
  }
}

/**
 * 会話を取得
 */
export async function getConversation(conversationId: string): Promise<Conversation | null> {
  const { data } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single()

  return (data as Conversation | null) ?? null
}

/**
 * 既存のダイレクト会話を検索（内部ヘルパー）
 */
async function findExistingDirectConversation(
  userId: string,
  friendId: string
): Promise<Conversation | null> {
  // ユーザーの会話メンバーシップを取得
  const { data: userConvs } = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('user_id', userId)

  if (userConvs === null || userConvs.length === 0) return null

  const convIds = userConvs.map((m) => m.conversation_id)

  // フレンドとの共通会話を検索
  const { data: friendConvs } = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('user_id', friendId)
    .in('conversation_id', convIds)

  if (friendConvs === null || friendConvs.length === 0) return null

  const sharedConvIds = friendConvs.map((m) => m.conversation_id)

  // 共通会話からダイレクト会話を取得
  const { data: directConv } = await supabase
    .from('conversations')
    .select('*')
    .in('id', sharedConvIds)
    .eq('type', 'direct')
    .limit(1)
    .single()

  return (directConv as Conversation | null) ?? null
}

/**
 * ダイレクト会話を作成（既存があればそれを返す）
 */
export async function createDirectConversation(
  userId: string,
  friendId: string
): Promise<Conversation> {
  // 既存のダイレクト会話があるかチェック
  const existing = await findExistingDirectConversation(userId, friendId)
  if (existing !== null) return existing

  // 新しいダイレクト会話を作成
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert({
      type: 'direct',
      created_by: userId,
    })
    .select('*')
    .single()

  if (convError) {
    throw new Error('会話の作成に失敗しました')
  }

  // 両方のメンバーを追加
  const { error: memberError } = await supabase.from('conversation_members').insert([
    { conversation_id: conversation.id, user_id: userId },
    { conversation_id: conversation.id, user_id: friendId },
  ])

  if (memberError) {
    throw new Error('メンバーの追加に失敗しました')
  }

  return conversation as Conversation
}

/**
 * グループ会話を作成
 */
export async function createGroupConversation(
  userId: string,
  name: string,
  iconText: string,
  iconColor: string,
  memberIds: string[]
): Promise<Conversation> {
  // 招待コードを生成
  const inviteCode = crypto.randomUUID().slice(0, 8)

  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert({
      type: 'group',
      name,
      icon_text: iconText,
      icon_color: iconColor,
      invite_code: inviteCode,
      created_by: userId,
    })
    .select('*')
    .single()

  if (convError) {
    throw new Error('グループの作成に失敗しました')
  }

  // 作成者と指定メンバーを追加
  const allMemberIds = [userId, ...memberIds.filter((id) => id !== userId)]
  const { error: memberError } = await supabase.from('conversation_members').insert(
    allMemberIds.map((id) => ({
      conversation_id: conversation.id,
      user_id: id,
    }))
  )

  if (memberError) {
    throw new Error('メンバーの追加に失敗しました')
  }

  return conversation as Conversation
}

/**
 * 招待コードでグループに参加
 */
export async function joinGroupByInviteCode(
  userId: string,
  inviteCode: string
): Promise<Conversation> {
  const { data: conversation, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('invite_code', inviteCode)
    .eq('type', 'group')
    .single()

  if (error) {
    throw new Error('招待コードが見つかりません')
  }

  // 既にメンバーかチェック
  const { data: existing } = await supabase
    .from('conversation_members')
    .select('id')
    .eq('conversation_id', conversation.id)
    .eq('user_id', userId)
    .single()

  if (existing !== null) {
    return conversation as Conversation
  }

  const { error: joinError } = await supabase.from('conversation_members').insert({
    conversation_id: conversation.id,
    user_id: userId,
  })

  if (joinError) {
    throw new Error('グループへの参加に失敗しました')
  }

  return conversation as Conversation
}

/**
 * 会話から退出
 */
export async function leaveConversation(userId: string, conversationId: string): Promise<void> {
  const { error } = await supabase
    .from('conversation_members')
    .delete()
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)

  if (error) {
    throw new Error('会話からの退出に失敗しました')
  }
}

/**
 * グループ情報を更新
 */
export async function updateGroup(
  conversationId: string,
  updates: { name?: string; icon_text?: string; icon_color?: string }
): Promise<Conversation> {
  const { data, error } = await supabase
    .from('conversations')
    .update(updates)
    .eq('id', conversationId)
    .select('*')
    .single()

  if (error) {
    throw new Error('グループの更新に失敗しました')
  }

  return data as Conversation
}
