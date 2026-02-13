'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuthContext, AVATAR_COLORS } from '@/features/messenger'

function registerServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    void navigator.serviceWorker.register('/sw.js')
  }
}

async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false

  const result = await Notification.requestPermission()
  return result === 'granted'
}

async function checkIsAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase.from('profiles').select('is_admin').eq('id', userId).single()

  return data?.is_admin === true
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout, updateProfile, isLoading } = useAuthContext()
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [notifEnabled, setNotifEnabled] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // Check notification status and admin status
  useEffect(() => {
    if (user === null) return
    if ('Notification' in window) {
      setNotifEnabled(Notification.permission === 'granted')
    }
    registerServiceWorker()
    void checkIsAdmin(user.id).then(setIsAdmin)
  }, [user])

  if (user === null) {
    return null
  }

  function startEditing() {
    if (user === null) return
    setEditName(user.display_name)
    setEditColor(user.avatar_color)
    setIsEditing(true)
  }

  async function handleSave() {
    if (user === null) return
    setIsSaving(true)
    try {
      const updates: { display_name?: string; avatar_color?: string; avatar_text?: string } = {}

      if (editName !== user.display_name) {
        updates.display_name = editName
        updates.avatar_text = editName.slice(0, 2)
      }
      if (editColor !== user.avatar_color) {
        updates.avatar_color = editColor
      }

      if (Object.keys(updates).length > 0) {
        await updateProfile(updates)
      }
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleLogout() {
    await logout()
    router.push('/m/login')
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-6 text-xl font-bold text-gray-800">マイページ</h1>

      {/* Avatar */}
      <div className="mb-6 flex flex-col items-center">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold text-white"
          style={{ backgroundColor: isEditing ? editColor : user.avatar_color }}
        >
          {isEditing ? editName.slice(0, 2) || '?' : user.avatar_text}
        </div>
        <h2 className="mt-3 text-xl font-bold text-gray-800">
          {isEditing ? editName || '表示名' : user.display_name}
        </h2>
      </div>

      {isEditing ? (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4">
            <label htmlFor="editName" className="mb-1 block text-sm font-medium text-gray-700">
              表示名
            </label>
            <input
              id="editName"
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              maxLength={20}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">アイコンの色</label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setEditColor(color)}
                  className={`h-10 w-10 rounded-full border-2 transition-transform ${
                    editColor === color ? 'scale-110 border-gray-800' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`色: ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                void handleSave()
              }}
              disabled={isSaving || editName.trim() === ''}
              className="flex-1 rounded-lg bg-blue-500 py-3 font-bold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 rounded-lg border border-gray-300 py-3 font-bold text-gray-700 transition-colors hover:bg-gray-50"
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Friend code */}
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="mb-1 text-xs text-gray-500">フレンドコード</p>
            <p className="font-mono text-lg font-bold text-gray-800">{user.friend_code}</p>
          </div>

          {/* Edit profile button */}
          <button
            type="button"
            onClick={startEditing}
            className="w-full rounded-2xl bg-white p-4 text-left font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50"
          >
            {'\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB\u3092\u7DE8\u96C6'}
          </button>

          {/* Notification toggle */}
          <NotificationToggle
            enabled={notifEnabled}
            onToggle={() => {
              void requestNotificationPermission().then((granted) => {
                setNotifEnabled(granted)
              })
            }}
          />

          {/* iOS home screen guidance */}
          <IosHomeScreenGuide />

          {/* Admin link */}
          {isAdmin && (
            <Link
              href="/m/admin"
              className="block w-full rounded-2xl bg-white p-4 text-left font-medium text-purple-600 shadow-sm transition-colors hover:bg-purple-50"
            >
              {'\u7BA1\u7406\u8005\u30D1\u30CD\u30EB'}
            </Link>
          )}

          {/* Logout button */}
          <button
            type="button"
            onClick={() => {
              void handleLogout()
            }}
            disabled={isLoading}
            className="w-full rounded-2xl bg-white p-4 text-left font-medium text-red-500 shadow-sm transition-colors hover:bg-red-50"
          >
            {'\u30ED\u30B0\u30A2\u30A6\u30C8'}
          </button>
        </div>
      )}
    </div>
  )
}

function NotificationToggle({
  enabled,
  onToggle,
}: {
  readonly enabled: boolean
  readonly onToggle: () => void
}) {
  const notSupported = typeof window !== 'undefined' && !('Notification' in window)
  const denied =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    Notification.permission === 'denied'

  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
      <div>
        <p className="font-medium text-gray-800">{'\u30D7\u30C3\u30B7\u30E5\u901A\u77E5'}</p>
        {notSupported && (
          <p className="text-xs text-gray-400">
            {'\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u3067\u306F\u672A\u5BFE\u5FDC'}
          </p>
        )}
        {denied && (
          <p className="text-xs text-red-400">
            {
              '\u30D6\u30E9\u30A6\u30B6\u8A2D\u5B9A\u3067\u30D6\u30ED\u30C3\u30AF\u3055\u308C\u3066\u3044\u307E\u3059'
            }
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onToggle}
        disabled={notSupported || denied}
        className={`relative h-7 w-12 rounded-full transition-colors ${
          enabled ? 'bg-blue-500' : 'bg-gray-300'
        } disabled:opacity-50`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}

function IosHomeScreenGuide() {
  const [isIos, setIsIos] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const ua = navigator.userAgent
    setIsIos(/iPad|iPhone|iPod/.test(ua))
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
  }, [])

  if (!isIos || isStandalone) return null

  return (
    <div className="rounded-2xl bg-blue-50 p-4 shadow-sm">
      <p className="mb-1 text-sm font-medium text-blue-800">
        {'\u30DB\u30FC\u30E0\u753B\u9762\u306B\u8FFD\u52A0'}
      </p>
      <p className="text-xs text-blue-600">
        {'\u30D6\u30E9\u30A6\u30B6\u306E\u5171\u6709\u30DC\u30BF\u30F3'} {'\u2192'}{' '}
        {
          '\u300C\u30DB\u30FC\u30E0\u753B\u9762\u306B\u8FFD\u52A0\u300D\u3067\u30A2\u30D7\u30EA\u3068\u3057\u3066\u4F7F\u3048\u307E\u3059'
        }
      </p>
    </div>
  )
}
