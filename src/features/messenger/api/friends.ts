/**
 * フレンドAPI関数
 */

import { supabase } from '@/lib/supabase'
import type { Profile } from '../types'

/**
 * フレンド一覧を取得
 */
export async function getFriends(userId: string): Promise<Profile[]> {
  // user_idまたはfriend_idが自分のフレンドシップを取得
  const { data: friendships, error } = await supabase
    .from('friendships')
    .select('user_id, friend_id')
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`)

  if (error) {
    throw new Error('フレンド一覧の取得に失敗しました')
  }

  if (friendships.length === 0) {
    return []
  }

  // フレンドIDを抽出
  const friendIds = friendships.map((f) => (f.user_id === userId ? f.friend_id : f.user_id))

  // フレンドプロフィールを取得
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', friendIds)

  if (profilesError) {
    throw new Error('フレンドプロフィールの取得に失敗しました')
  }

  return profiles
}

/**
 * フレンドコードからプロフィールを取得
 */
export async function getProfileByFriendCode(friendCode: string): Promise<Profile | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('friend_code', friendCode)
    .single()

  return profile ?? null
}

/**
 * フレンドコードでフレンドを追加
 */
export async function addFriendByCode(userId: string, friendCode: string): Promise<Profile> {
  // フレンドプロフィールを検索
  const friendProfile = await getProfileByFriendCode(friendCode)

  if (friendProfile === null) {
    throw new Error('フレンドコードが見つかりません')
  }

  if (friendProfile.id === userId) {
    throw new Error('自分自身をフレンドに追加できません')
  }

  // 既にフレンドかチェック
  const { data: existing } = await supabase
    .from('friendships')
    .select('id')
    .or(
      `and(user_id.eq.${userId},friend_id.eq.${friendProfile.id}),and(user_id.eq.${friendProfile.id},friend_id.eq.${userId})`
    )
    .limit(1)

  if (existing !== null && existing.length > 0) {
    throw new Error('既にフレンドです')
  }

  // 双方向のフレンドシップを作成
  const { error: error1 } = await supabase
    .from('friendships')
    .insert({ user_id: userId, friend_id: friendProfile.id })

  if (error1) {
    throw new Error('フレンド追加に失敗しました')
  }

  const { error: error2 } = await supabase
    .from('friendships')
    .insert({ user_id: friendProfile.id, friend_id: userId })

  if (error2) {
    // 最初のinsertをロールバック
    await supabase
      .from('friendships')
      .delete()
      .eq('user_id', userId)
      .eq('friend_id', friendProfile.id)
    throw new Error('フレンド追加に失敗しました')
  }

  return friendProfile
}

/**
 * フレンドを削除
 */
export async function removeFriend(userId: string, friendId: string): Promise<void> {
  // 双方向のフレンドシップを削除
  await supabase
    .from('friendships')
    .delete()
    .or(
      `and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`
    )
}
