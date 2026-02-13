/**
 * メッセンジャー機能の定数定義
 */

/**
 * アバターの色選択肢
 */
export const AVATAR_COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
] as const

/**
 * メッセージ最大文字数
 */
export const MESSAGE_MAX_LENGTH = 2000

/**
 * 画像最大サイズ（MB）
 */
export const IMAGE_MAX_SIZE_MB = 10

/**
 * 画像最大サイズ（バイト）
 */
export const IMAGE_MAX_SIZE_BYTES = IMAGE_MAX_SIZE_MB * 1024 * 1024

/**
 * 許可する画像MIMEタイプ
 */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const

/**
 * メッセージのページネーション数
 */
export const MESSAGES_PER_PAGE = 50

/**
 * 会話のページネーション数
 */
export const CONVERSATIONS_PER_PAGE = 50

/**
 * 送信音のファイルパス
 */
export const SOUND_SEND = '/sounds/send.wav'

/**
 * 受信音のファイルパス
 */
export const SOUND_RECEIVE = '/sounds/receive.wav'

/**
 * リアクション絵文字
 */
export const REACTION_EMOJIS = ['\uD83D\uDC4D', '\u2705'] as const

/**
 * 日付表示のタイムゾーン
 */
export const DATE_TIMEZONE = 'Asia/Tokyo'

/**
 * フレンドコードの長さ
 */
export const FRIEND_CODE_LENGTH = 8

/**
 * メッセージ画像のストレージバケット名
 */
export const MESSAGE_IMAGES_BUCKET = 'message-images'
