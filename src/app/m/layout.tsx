'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { AuthProvider, useAuthContext, getConversations } from '@/features/messenger'
import type { ConversationWithDetails } from '@/features/messenger'
import { type ReactNode, useEffect, useCallback, useRef } from 'react'

// Pages that don't need auth
const PUBLIC_PATHS = ['/m/login', '/m/signup', '/m/add', '/m/group/invite']

/**
 * Realtime payload for messages table
 */
interface RealtimeNewMessage {
  readonly sender_id: string
  readonly content: string | null
  readonly image_url: string | null
  readonly conversation_id: string
}

function showBrowserNotification(title: string, body: string): void {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return

  const notification = new Notification(title, {
    body,
    icon: '/icon-192.png',
    tag: 'messenger-message',
  })

  notification.onclick = () => {
    window.focus()
    notification.close()
  }
}

function updateAppBadge(count: number): void {
  if (!('setAppBadge' in navigator)) return
  if (count > 0) {
    void (navigator as Navigator & { setAppBadge: (n: number) => Promise<void> }).setAppBadge(count)
  } else {
    void (navigator as Navigator & { clearAppBadge: () => Promise<void> }).clearAppBadge()
  }
}

function MessengerLayoutInner({ children }: { readonly children: ReactNode }) {
  const pathname = usePathname()
  const { isAuthenticated, isLoading, user } = useAuthContext()
  const conversationsRef = useRef<ConversationWithDetails[]>([])

  // Global realtime notification subscription
  const refreshAndNotify = useCallback(async () => {
    if (user === null) return
    try {
      const data = await getConversations(user.id)
      conversationsRef.current = data
      const totalUnread = data.reduce((sum, c) => sum + c.unreadCount, 0)
      updateAppBadge(totalUnread)
    } catch {
      // Silent fail
    }
  }, [user])

  useEffect(() => {
    if (user === null) return

    const currentUserId = user.id

    const channel = supabase
      .channel('global-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          void refreshAndNotify()

          const msg = payload.new as RealtimeNewMessage
          if (msg.sender_id !== currentUserId) {
            // Find sender name from cached conversations
            const convs = conversationsRef.current
            let senderName = 'メッセージ'
            for (const c of convs) {
              const member = c.members.find((m) => m.user_id === msg.sender_id)
              if (member !== undefined) {
                senderName = member.profile.display_name
                break
              }
            }
            const body = msg.image_url !== null ? '\uD83D\uDCF7 画像' : (msg.content ?? '')
            showBrowserNotification(senderName, body)
          }
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversations' }, () => {
        void refreshAndNotify()
      })
      .subscribe()

    // Initial load for badge
    void refreshAndNotify()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [user, refreshAndNotify])

  // Public pages (login, signup, add friend via URL)
  const isPublicPage = PUBLIC_PATHS.some((path) => pathname.startsWith(path))

  // Show loading spinner while checking auth
  if (isLoading && !isPublicPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  // Redirect to login if not authenticated (except public pages)
  if (!isAuthenticated && !isPublicPage && !isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="mb-4 text-gray-600">ログインが必要です</p>
          <Link
            href="/m/login"
            className="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
          >
            ログイン画面へ
          </Link>
        </div>
      </div>
    )
  }

  // Hide bottom nav on login/signup/chat pages
  const hideBottomNav = isPublicPage || pathname.startsWith('/m/chat/')

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex-1 pb-16">{children}</div>

      {!hideBottomNav && isAuthenticated && <BottomNavigation currentPath={pathname} />}
    </div>
  )
}

function BottomNavigation({ currentPath }: { readonly currentPath: string }) {
  const tabs = [
    { path: '/m', label: 'トーク', icon: 'talk', exact: true },
    { path: '/m/friends', label: 'フレンド', icon: 'friends', exact: false },
    { path: '/m/profile', label: 'マイ', icon: 'profile', exact: false },
  ] as const

  function isActive(tabPath: string, exact: boolean): boolean {
    if (exact) {
      return currentPath === tabPath
    }
    return currentPath.startsWith(tabPath)
  }

  function getIcon(icon: string): string {
    switch (icon) {
      case 'talk':
        return '\u{1F5E8}\uFE0F'
      case 'friends':
        return '\u{1F465}'
      case 'profile':
        return '\u{1F464}'
      default:
        return '\u{2B50}'
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-lg">
        {tabs.map((tab) => {
          const active = isActive(tab.path, tab.exact)
          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`flex flex-1 flex-col items-center py-2 text-xs transition-colors ${
                active ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-xl">{getIcon(tab.icon)}</span>
              <span className={`mt-0.5 ${active ? 'font-bold' : ''}`}>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default function MessengerLayout({ children }: { readonly children: ReactNode }) {
  return (
    <AuthProvider>
      <MessengerLayoutInner>{children}</MessengerLayoutInner>
    </AuthProvider>
  )
}
