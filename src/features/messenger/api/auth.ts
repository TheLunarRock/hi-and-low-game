/**
 * 認証API関数
 */

import { supabase } from '@/lib/supabase'
import type { Profile, ProfileUpdate, SignUpFormData } from '../types'

/**
 * 新規ユーザー登録
 */
export async function signUp(data: SignUpFormData): Promise<{ profile: Profile }> {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        display_name: data.displayName,
      },
    },
  })

  if (authError) {
    throw new Error(authError.message)
  }

  if (authData.user === null) {
    throw new Error('登録に失敗しました')
  }

  // トリガーによるプロフィール作成を待つ
  await new Promise((resolve) => setTimeout(resolve, 500))

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single()

  if (profileError) {
    throw new Error('プロフィールの作成に失敗しました')
  }

  return { profile }
}

/**
 * ログイン
 */
export async function login(email: string, password: string): Promise<{ profile: Profile }> {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    throw new Error(authError.message)
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single()

  if (profileError) {
    throw new Error('プロフィールの取得に失敗しました')
  }

  return { profile }
}

/**
 * ログアウト
 */
export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new Error(error.message)
  }
}

/**
 * 現在のユーザーを取得
 */
export async function getCurrentUser(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user === null) {
    return null
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return profile ?? null
}

/**
 * プロフィールを取得
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single()

  return profile ?? null
}

/**
 * プロフィールを更新
 */
export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select('*')
    .single()

  if (error) {
    throw new Error('プロフィールの更新に失敗しました')
  }

  return profile
}
