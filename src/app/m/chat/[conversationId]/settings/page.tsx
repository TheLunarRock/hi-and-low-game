'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  useAuthContext,
  getConversation,
  getFriends,
  leaveConversation,
} from '@/features/messenger'
import type { Conversation, Profile, ConversationMember } from '@/features/messenger'

// ---- Types ----

interface MemberWithProfile {
  readonly member: ConversationMember
  readonly profile: Profile
}

// ---- Module-level data fetching functions ----

async function fetchMembers(conversationId: string): Promise<MemberWithProfile[]> {
  const { data } = await supabase
    .from('conversation_members')
    .select('*, profile:profiles(*)')
    .eq('conversation_id', conversationId)

  if (data === null) return []

  return data.map((row) => ({
    member: row as unknown as ConversationMember,
    profile: (row as Record<string, unknown>).profile as Profile,
  }))
}

async function addMemberToGroup(conversationId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('conversation_members')
    .insert({ conversation_id: conversationId, user_id: userId })

  return error === null
}

function buildInviteLink(inviteCode: string): string {
  if (typeof window === 'undefined') return ''
  return window.location.origin + '/m/group/invite/' + inviteCode
}

function filterAddableFriends(
  friends: readonly Profile[],
  members: readonly MemberWithProfile[]
): Profile[] {
  const memberIds = new Set(members.map((m) => m.profile.id))
  return friends.filter((f) => !memberIds.has(f.id))
}

// ---- Sub-components (module-level to keep nesting shallow) ----

function BackArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.5 15L7.5 10L12.5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function SettingsHeader({ onBack }: { readonly onBack: () => void }) {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-3 shadow-sm">
      <button
        type="button"
        onClick={onBack}
        className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100"
        aria-label={'\u623B\u308B'}
      >
        <BackArrowIcon />
      </button>
      <h1 className="text-lg font-bold text-gray-800">{'\u30B0\u30EB\u30FC\u30D7\u8A2D\u5B9A'}</h1>
    </div>
  )
}

function GroupIconSection({ conversation }: { readonly conversation: Conversation }) {
  const iconText = conversation.icon_text ?? '\u30B0'
  const iconColor = conversation.icon_color ?? '#6B7280'
  const groupName = conversation.name ?? '\u30B0\u30EB\u30FC\u30D7'

  return (
    <div className="flex flex-col items-center bg-white px-4 py-6">
      <div
        className="mb-3 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
        style={{ backgroundColor: iconColor }}
      >
        {iconText}
      </div>
      <h2 className="text-xl font-bold text-gray-800">{groupName}</h2>
    </div>
  )
}

function InviteLinkSection({ inviteCode }: { readonly inviteCode: string | null }) {
  const [copied, setCopied] = useState(false)

  if (inviteCode === null) return null

  const link = buildInviteLink(inviteCode)

  function handleCopy() {
    void navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="border-t border-gray-100 bg-white px-4 py-4">
      <h3 className="mb-2 text-sm font-bold text-gray-600">{'\u62DB\u5F85\u30EA\u30F3\u30AF'}</h3>
      <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
        <p className="min-w-0 flex-1 truncate text-sm text-gray-700">{link}</p>
        <button
          type="button"
          onClick={handleCopy}
          className="flex shrink-0 items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-bold text-white transition-colors hover:bg-blue-600"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span>{copied ? '\u30B3\u30D4\u30FC\u6E08\u307F' : '\u30B3\u30D4\u30FC'}</span>
        </button>
      </div>
    </div>
  )
}

function MemberAvatar({ profile }: { readonly profile: Profile }) {
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
      style={{ backgroundColor: profile.avatar_color }}
    >
      {profile.avatar_text}
    </div>
  )
}

function MemberListItem({
  profile,
  isCurrentUser,
}: {
  readonly profile: Profile
  readonly isCurrentUser: boolean
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <MemberAvatar profile={profile} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-800">{profile.display_name}</p>
      </div>
      {isCurrentUser && (
        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
          {'\u81EA\u5206'}
        </span>
      )}
    </div>
  )
}

function MembersSection({
  members,
  currentUserId,
  onAddClick,
}: {
  readonly members: readonly MemberWithProfile[]
  readonly currentUserId: string
  readonly onAddClick: () => void
}) {
  return (
    <div className="border-t border-gray-100 bg-white py-2">
      <div className="flex items-center justify-between px-4 py-2">
        <h3 className="text-sm font-bold text-gray-600">
          {`\u30E1\u30F3\u30D0\u30FC (${String(members.length)})`}
        </h3>
        <button
          type="button"
          onClick={onAddClick}
          className="flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-bold text-white transition-colors hover:bg-blue-600"
        >
          <PlusIcon />
          <span>{'\u8FFD\u52A0'}</span>
        </button>
      </div>
      {members.map((m) => (
        <MemberListItem
          key={m.profile.id}
          profile={m.profile}
          isCurrentUser={m.profile.id === currentUserId}
        />
      ))}
    </div>
  )
}

function FriendSelectorItem({
  friend,
  isAdding,
  onAdd,
}: {
  readonly friend: Profile
  readonly isAdding: boolean
  readonly onAdd: () => void
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <MemberAvatar profile={friend} />
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">
        {friend.display_name}
      </p>
      <button
        type="button"
        onClick={onAdd}
        disabled={isAdding}
        className="shrink-0 rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-bold text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
      >
        {isAdding ? '\u8FFD\u52A0\u4E2D...' : '\u8FFD\u52A0'}
      </button>
    </div>
  )
}

function FriendSelectorModal({
  friends,
  addingFriendId,
  onAdd,
  onClose,
}: {
  readonly friends: readonly Profile[]
  readonly addingFriendId: string | null
  readonly onAdd: (friendId: string) => void
  readonly onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-lg rounded-t-2xl bg-white pb-6 sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h3 className="text-lg font-bold text-gray-800">
            {'\u30E1\u30F3\u30D0\u30FC\u3092\u8FFD\u52A0'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100"
          >
            {'\u00D7'}
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {friends.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-gray-500">
              {
                '\u8FFD\u52A0\u3067\u304D\u308B\u30D5\u30EC\u30F3\u30C9\u304C\u3044\u307E\u305B\u3093'
              }
            </p>
          )}
          {friends.map((friend) => (
            <FriendSelectorItem
              key={friend.id}
              friend={friend}
              isAdding={addingFriendId === friend.id}
              onAdd={() => onAdd(friend.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function LeaveConfirmModal({
  isLeaving,
  onConfirm,
  onCancel,
}: {
  readonly isLeaving: boolean
  readonly onConfirm: () => void
  readonly onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6">
        <h3 className="mb-2 text-lg font-bold text-gray-800">
          {'\u30B0\u30EB\u30FC\u30D7\u3092\u9000\u51FA'}
        </h3>
        <p className="mb-6 text-sm text-gray-600">
          {
            '\u672C\u5F53\u306B\u3053\u306E\u30B0\u30EB\u30FC\u30D7\u3092\u9000\u51FA\u3057\u307E\u3059\u304B\uFF1F\u9000\u51FA\u3059\u308B\u3068\u30E1\u30C3\u30BB\u30FC\u30B8\u5C65\u6B74\u306F\u898B\u3089\u308C\u306A\u304F\u306A\u308A\u307E\u3059\u3002'
          }
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLeaving}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {'\u30AD\u30E3\u30F3\u30BB\u30EB'}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLeaving}
            className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
          >
            {isLeaving ? '\u9000\u51FA\u4E2D...' : '\u9000\u51FA\u3059\u308B'}
          </button>
        </div>
      </div>
    </div>
  )
}

function LeaveGroupButton({ onLeave }: { readonly onLeave: () => void }) {
  return (
    <div className="border-t border-gray-100 bg-white px-4 py-4">
      <button
        type="button"
        onClick={onLeave}
        className="w-full rounded-lg border border-red-300 py-3 text-sm font-bold text-red-500 transition-colors hover:bg-red-50"
      >
        {'\u30B0\u30EB\u30FC\u30D7\u3092\u9000\u51FA'}
      </button>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
    </div>
  )
}

// ---- Main Page Component ----

export default function GroupSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthContext()
  const conversationId = typeof params.conversationId === 'string' ? params.conversationId : ''

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [members, setMembers] = useState<MemberWithProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [friends, setFriends] = useState<Profile[]>([])
  const [addingFriendId, setAddingFriendId] = useState<string | null>(null)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  // Load conversation and members
  useEffect(() => {
    if (conversationId === '' || user === null) return

    let cancelled = false

    async function load() {
      try {
        const [conv, membersData] = await Promise.all([
          getConversation(conversationId),
          fetchMembers(conversationId),
        ])

        if (cancelled) return

        setConversation(conv)
        setMembers(membersData)
      } catch {
        // Silent fail
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [conversationId, user])

  function handleBack() {
    router.push(`/m/chat/${conversationId}`)
  }

  function handleOpenAddModal() {
    if (user === null) return
    setShowAddModal(true)
    void getFriends(user.id)
      .then((data) => setFriends(data))
      .catch(() => undefined)
  }

  function handleCloseAddModal() {
    setShowAddModal(false)
    setFriends([])
    setAddingFriendId(null)
  }

  async function handleAddMember(friendId: string) {
    setAddingFriendId(friendId)
    const success = await addMemberToGroup(conversationId, friendId)

    if (success) {
      const updatedMembers = await fetchMembers(conversationId)
      setMembers(updatedMembers)
      setAddingFriendId(null)
      // Remove added friend from the selector list
      setFriends((prev) => prev.filter((f) => f.id !== friendId))
    } else {
      setAddingFriendId(null)
    }
  }

  async function handleLeave() {
    if (user === null || isLeaving) return

    setIsLeaving(true)
    try {
      await leaveConversation(user.id, conversationId)
      router.push('/m')
    } catch {
      setIsLeaving(false)
      setShowLeaveConfirm(false)
    }
  }

  if (user === null) return null

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col bg-gray-50">
        <SettingsHeader onBack={handleBack} />
        <LoadingSpinner />
      </div>
    )
  }

  if (conversation === null) {
    return (
      <div className="flex h-screen flex-col bg-gray-50">
        <SettingsHeader onBack={handleBack} />
        <div className="px-4 py-16 text-center">
          <p className="text-sm text-gray-500">
            {'\u30B0\u30EB\u30FC\u30D7\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093'}
          </p>
        </div>
      </div>
    )
  }

  const addableFriends = filterAddableFriends(friends, members)

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <SettingsHeader onBack={handleBack} />

      <div className="flex-1 overflow-y-auto">
        {/* Group icon and name */}
        <GroupIconSection conversation={conversation} />

        {/* Invite link */}
        <InviteLinkSection inviteCode={conversation.invite_code} />

        {/* Members */}
        <MembersSection members={members} currentUserId={user.id} onAddClick={handleOpenAddModal} />

        {/* Leave group */}
        <LeaveGroupButton onLeave={() => setShowLeaveConfirm(true)} />
      </div>

      {/* Add member modal */}
      {showAddModal && (
        <FriendSelectorModal
          friends={addableFriends}
          addingFriendId={addingFriendId}
          onAdd={(friendId: string) => {
            void handleAddMember(friendId)
          }}
          onClose={handleCloseAddModal}
        />
      )}

      {/* Leave confirmation modal */}
      {showLeaveConfirm && (
        <LeaveConfirmModal
          isLeaving={isLeaving}
          onConfirm={() => {
            void handleLeave()
          }}
          onCancel={() => setShowLeaveConfirm(false)}
        />
      )}
    </div>
  )
}
