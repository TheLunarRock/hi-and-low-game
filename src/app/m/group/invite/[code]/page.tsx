'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuthContext, joinGroupByInviteCode } from '@/features/messenger'
import type { Profile } from '@/features/messenger'

/**
 * Group info fetched by invite code
 */
interface GroupInfo {
  readonly id: string
  readonly name: string
  readonly iconText: string
  readonly iconColor: string
  readonly memberCount: number
}

/**
 * Page state union for clear rendering logic
 */
type PageState =
  | { readonly status: 'loading' }
  | { readonly status: 'not-found' }
  | { readonly status: 'error'; readonly message: string }
  | { readonly status: 'loaded'; readonly group: GroupInfo; readonly isMember: boolean }

/**
 * Fetch group information by invite code
 */
async function fetchGroupByInviteCode(inviteCode: string): Promise<GroupInfo | null> {
  const { data: conversation, error } = await supabase
    .from('conversations')
    .select('id, name, icon_text, icon_color')
    .eq('invite_code', inviteCode)
    .eq('type', 'group')
    .single()

  if (error) {
    return null
  }

  const { count } = await supabase
    .from('conversation_members')
    .select('id', { count: 'exact', head: true })
    .eq('conversation_id', conversation.id)

  return {
    id: conversation.id,
    name: (conversation.name as string | null) ?? '\u30B0\u30EB\u30FC\u30D7',
    iconText: (conversation.icon_text as string | null) ?? '\u30B0',
    iconColor: (conversation.icon_color as string | null) ?? '#6B7280',
    memberCount: count ?? 0,
  }
}

/**
 * Check if a user is already a member of a conversation
 */
async function checkMembership(conversationId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('conversation_members')
    .select('id')
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
    .single()

  return data !== null
}

/**
 * Fetch group info and membership status in one logical operation
 */
async function fetchGroupAndMembership(
  inviteCode: string,
  userId: string | null
): Promise<{ readonly group: GroupInfo; readonly isMember: boolean } | null> {
  const group = await fetchGroupByInviteCode(inviteCode)

  if (group === null) {
    return null
  }

  const isMember = userId !== null ? await checkMembership(group.id, userId) : false

  return { group, isMember }
}

/**
 * Group invite page
 *
 * Accessed via /m/group/invite/[code]
 * Shows group info and allows joining via invite link
 */
export default function GroupInvitePage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuthContext()

  const [pageState, setPageState] = useState<PageState>({ status: 'loading' })
  const [isJoining, setIsJoining] = useState(false)

  const inviteCode = typeof params.code === 'string' ? params.code : ''

  // Fetch group info on mount
  useEffect(() => {
    if (inviteCode === '') {
      setPageState({ status: 'not-found' })
      return
    }

    let cancelled = false

    async function loadGroup() {
      try {
        const result = await fetchGroupAndMembership(inviteCode, user?.id ?? null)

        if (cancelled) return

        if (result === null) {
          setPageState({ status: 'not-found' })
        } else {
          setPageState({ status: 'loaded', group: result.group, isMember: result.isMember })
        }
      } catch {
        if (cancelled) return
        setPageState({
          status: 'error',
          message:
            '\u30B0\u30EB\u30FC\u30D7\u60C5\u5831\u306E\u53D6\u5F97\u306B\u5931\u6557\u3057\u307E\u3057\u305F',
        })
      }
    }

    void loadGroup()

    return () => {
      cancelled = true
    }
  }, [inviteCode, user])

  async function handleJoin() {
    if (user === null || isJoining) return

    setIsJoining(true)

    try {
      const conversation = await joinGroupByInviteCode(user.id, inviteCode)
      router.push(`/m/chat/${conversation.id}`)
    } catch {
      setPageState({
        status: 'error',
        message:
          '\u30B0\u30EB\u30FC\u30D7\u3078\u306E\u53C2\u52A0\u306B\u5931\u6557\u3057\u307E\u3057\u305F',
      })
      setIsJoining(false)
    }
  }

  // Loading state
  if (isAuthLoading || pageState.status === 'loading') {
    return (
      <div className="mx-auto max-w-lg">
        <InviteHeader />
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      </div>
    )
  }

  // Not found state
  if (pageState.status === 'not-found') {
    return (
      <div className="mx-auto max-w-lg">
        <InviteHeader />
        <div className="px-4 py-16 text-center">
          <p className="mb-2 text-4xl">{'\uD83D\uDD17'}</p>
          <p className="mb-1 font-bold text-gray-800">
            {'\u62DB\u5F85\u30EA\u30F3\u30AF\u304C\u7121\u52B9\u3067\u3059'}
          </p>
          <p className="mb-6 text-sm text-gray-500">
            {
              '\u3053\u306E\u62DB\u5F85\u30B3\u30FC\u30C9\u306F\u5B58\u5728\u3057\u306A\u3044\u304B\u3001\u671F\u9650\u5207\u308C\u3067\u3059'
            }
          </p>
          <Link
            href="/m"
            className="inline-block rounded-lg bg-blue-500 px-6 py-3 font-bold text-white transition-colors hover:bg-blue-600"
          >
            {'\u30C8\u30FC\u30AF\u4E00\u89A7\u3078'}
          </Link>
        </div>
      </div>
    )
  }

  // Error state
  if (pageState.status === 'error') {
    return (
      <div className="mx-auto max-w-lg">
        <InviteHeader />
        <div className="px-4 py-16 text-center">
          <p className="mb-2 text-4xl">{'\u26A0\uFE0F'}</p>
          <p className="mb-6 text-sm text-red-600">{pageState.message}</p>
          <Link
            href="/m"
            className="inline-block rounded-lg bg-blue-500 px-6 py-3 font-bold text-white transition-colors hover:bg-blue-600"
          >
            {'\u30C8\u30FC\u30AF\u4E00\u89A7\u3078'}
          </Link>
        </div>
      </div>
    )
  }

  // Loaded state
  const { group, isMember } = pageState

  return (
    <div className="mx-auto max-w-lg">
      <InviteHeader />

      <div className="px-4 py-8">
        {/* Group info card */}
        <div className="mb-8 flex flex-col items-center rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          {/* Group icon */}
          <div
            className="mb-4 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
            style={{ backgroundColor: group.iconColor }}
          >
            {group.iconText}
          </div>

          {/* Group name */}
          <h2 className="mb-2 text-xl font-bold text-gray-800">{group.name}</h2>

          {/* Member count */}
          <p className="text-sm text-gray-500">
            {`${String(group.memberCount)}\u4EBA\u306E\u30E1\u30F3\u30D0\u30FC`}
          </p>
        </div>

        {/* Action area */}
        <ActionArea
          user={user}
          isMember={isMember}
          isJoining={isJoining}
          conversationId={group.id}
          onJoin={() => {
            void handleJoin()
          }}
        />
      </div>
    </div>
  )
}

/**
 * Header with back link
 */
function InviteHeader() {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-3 shadow-sm">
      <Link
        href="/m"
        className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100"
        aria-label={'\u623B\u308B'}
      >
        <BackArrowIcon />
      </Link>
      <h1 className="text-lg font-bold text-gray-800">{'\u30B0\u30EB\u30FC\u30D7\u62DB\u5F85'}</h1>
    </div>
  )
}

/**
 * Login prompt for unauthenticated users
 */
function NotLoggedInPrompt() {
  return (
    <div className="text-center">
      <p className="mb-4 text-sm text-gray-600">
        {
          '\u30B0\u30EB\u30FC\u30D7\u306B\u53C2\u52A0\u3059\u308B\u306B\u306F\u30ED\u30B0\u30A4\u30F3\u304C\u5FC5\u8981\u3067\u3059'
        }
      </p>
      <Link
        href="/m/login"
        className="inline-block w-full rounded-lg bg-blue-500 py-3 text-center font-bold text-white transition-colors hover:bg-blue-600"
      >
        {'\u30ED\u30B0\u30A4\u30F3\u3057\u3066\u53C2\u52A0'}
      </Link>
    </div>
  )
}

/**
 * Action area that shows the appropriate UI based on auth/membership state
 */
function ActionArea({
  user,
  isMember,
  isJoining,
  conversationId,
  onJoin,
}: {
  readonly user: Profile | null
  readonly isMember: boolean
  readonly isJoining: boolean
  readonly conversationId: string
  readonly onJoin: () => void
}) {
  if (user === null) {
    return <NotLoggedInPrompt />
  }

  if (isMember) {
    return <AlreadyMemberView conversationId={conversationId} />
  }

  return <JoinButton isJoining={isJoining} onJoin={onJoin} />
}

/**
 * View shown when user is already a group member
 */
function AlreadyMemberView({ conversationId }: { readonly conversationId: string }) {
  return (
    <div className="text-center">
      <p className="mb-4 text-sm text-gray-600">
        {
          '\u3059\u3067\u306B\u3053\u306E\u30B0\u30EB\u30FC\u30D7\u306E\u30E1\u30F3\u30D0\u30FC\u3067\u3059'
        }
      </p>
      <Link
        href={`/m/chat/${conversationId}`}
        className="inline-block w-full rounded-lg bg-green-500 py-3 text-center font-bold text-white transition-colors hover:bg-green-600"
      >
        {'\u30C8\u30FC\u30AF\u3092\u958B\u304F'}
      </Link>
    </div>
  )
}

/**
 * Join group button
 */
function JoinButton({
  isJoining,
  onJoin,
}: {
  readonly isJoining: boolean
  readonly onJoin: () => void
}) {
  return (
    <button
      type="button"
      onClick={onJoin}
      disabled={isJoining}
      className="w-full rounded-lg bg-blue-500 py-3 font-bold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isJoining ? '\u53C2\u52A0\u4E2D...' : '\u30B0\u30EB\u30FC\u30D7\u306B\u53C2\u52A0'}
    </button>
  )
}

/**
 * Back arrow SVG icon
 */
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
