/**
 * ストレージAPI関数
 */

import { supabase } from '@/lib/supabase'
import { MESSAGE_IMAGES_BUCKET } from '../constants'

/**
 * 画像をアップロードしてURLを返す
 */
export async function uploadImage(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop() ?? 'jpg'
  const fileName = `${userId}/${Date.now()}.${fileExt}`

  const { error } = await supabase.storage.from(MESSAGE_IMAGES_BUCKET).upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) {
    throw new Error('画像のアップロードに失敗しました')
  }

  const { data: urlData } = supabase.storage.from(MESSAGE_IMAGES_BUCKET).getPublicUrl(fileName)

  return urlData.publicUrl
}
