/**
 * メッセンジャー機能
 *
 * LINE風メッセージングアプリ
 */

// 認証API関数（公開）
export { signUp, login, logout, getCurrentUser, getProfile, updateProfile } from './api/auth'

// フレンドAPI関数（公開）
export { getFriends, addFriendByCode, getProfileByFriendCode, removeFriend } from './api/friends'

// 会話API関数（公開）
export {
  getConversations,
  getConversation,
  createDirectConversation,
  createGroupConversation,
  joinGroupByInviteCode,
  leaveConversation,
  updateGroup,
} from './api/conversations'

// メッセージAPI関数（公開）
export { getMessages, sendMessage, deleteMessage, markAsRead } from './api/messages'

// リアクションAPI関数（公開）
export { addReaction, removeReaction } from './api/reactions'

// ストレージAPI関数（公開）
export { uploadImage } from './api/storage'

// 認証インフラ（AppLayer向け - Provider/Context）
export { AuthProvider, useAuthContext } from './components/AuthProvider'

// 定数（公開）
export {
  AVATAR_COLORS,
  MESSAGE_MAX_LENGTH,
  IMAGE_MAX_SIZE_MB,
  IMAGE_MAX_SIZE_BYTES,
  ALLOWED_IMAGE_TYPES,
  MESSAGES_PER_PAGE,
  CONVERSATIONS_PER_PAGE,
  SOUND_SEND,
  SOUND_RECEIVE,
  REACTION_EMOJIS,
  DATE_TIMEZONE,
  FRIEND_CODE_LENGTH,
  MESSAGE_IMAGES_BUCKET,
} from './constants'

// ドメイン型定義のみ（公開）
export type {
  Profile,
  Conversation,
  ConversationMember,
  Message,
  MessageReaction,
  ConversationWithDetails,
  MessageWithDetails,
  AuthState,
  SignUpFormData,
  LoginFormData,
  ConversationType,
  ReactionEmoji,
} from './types'

// フック（内部使用のみ - 絶対に公開禁止）
// UIコンポーネント（AuthProvider以外は内部使用のみ）
// 内部ユーティリティ（公開禁止）
