'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  useAuthContext,
  createGroupConversation,
  getFriends,
  AVATAR_COLORS,
} from '@/features/messenger'
import type { Profile } from '@/features/messenger'

export default function CreateGroupPage() {
  const router = useRouter()
  const { user } = useAuthContext()

  const [name, setName] = useState('')
  const [iconText, setIconText] = useState('')
  const [iconColor, setIconColor] = useState<(typeof AVATAR_COLORS)[number]>(AVATAR_COLORS[0])
  const [friends, setFriends] = useState<Profile[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user === null) return

    let isMounted = true
    const uid = user.id

    async function loadFriends() {
      try {
        const data = await getFriends(uid)
        if (isMounted) {
          setFriends(data)
        }
      } catch {
        if (isMounted) {
          setError(
            '\u30D5\u30EC\u30F3\u30C9\u306E\u53D6\u5F97\u306B\u5931\u6557\u3057\u307E\u3057\u305F'
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadFriends()

    return () => {
      isMounted = false
    }
  }, [user])

  async function handleCreate() {
    if (user === null || name.trim() === '' || isCreating) return

    setIsCreating(true)
    setError(null)

    try {
      const resolvedIconText = iconText.trim() === '' ? name.trim().slice(0, 2) : iconText.trim()

      const conv = await createGroupConversation(
        user.id,
        name.trim(),
        resolvedIconText,
        iconColor,
        selectedIds
      )
      router.push(`/m/chat/${conv.id}`)
    } catch {
      setError(
        '\u30B0\u30EB\u30FC\u30D7\u306E\u4F5C\u6210\u306B\u5931\u6557\u3057\u307E\u3057\u305F'
      )
      setIsCreating(false)
    }
  }

  function handleToggleFriend(friendId: string) {
    setSelectedIds((prev) =>
      prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
    )
  }

  const displayIconText = iconText.trim() === '' ? name.trim().slice(0, 2) || '?' : iconText.trim()

  const canCreate = name.trim() !== '' && !isCreating

  if (user === null) return null

  return (
    <div className="mx-auto max-w-lg">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-white px-4 py-3 shadow-sm">
        <Link
          href="/m"
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100"
          aria-label={'\u623B\u308B'}
        >
          <BackArrowIcon />
        </Link>
        <h1 className="text-lg font-bold text-gray-800">
          {'\u30B0\u30EB\u30FC\u30D7\u4F5C\u6210'}
        </h1>
      </div>

      <div className="px-4 py-6">
        {/* Error */}
        {error !== null && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Group icon preview */}
        <div className="mb-6 flex flex-col items-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
            style={{ backgroundColor: iconColor }}
          >
            {displayIconText}
          </div>
        </div>

        {/* Group name input */}
        <div className="mb-4">
          <label htmlFor="groupName" className="mb-1 block text-sm font-medium text-gray-700">
            {'\u30B0\u30EB\u30FC\u30D7\u540D'}
            <span className="text-red-500"> *</span>
          </label>
          <input
            id="groupName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={'\u30B0\u30EB\u30FC\u30D7\u540D\u3092\u5165\u529B'}
            maxLength={30}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Icon text input */}
        <div className="mb-4">
          <label htmlFor="iconText" className="mb-1 block text-sm font-medium text-gray-700">
            {'\u30A2\u30A4\u30B3\u30F3\u6587\u5B57'}
            <span className="ml-1 text-xs text-gray-400">{'(1\u301C2\u6587\u5B57)'}</span>
          </label>
          <input
            id="iconText"
            type="text"
            value={iconText}
            onChange={(e) => setIconText(e.target.value.slice(0, 2))}
            placeholder={
              '\u7A7A\u6B04\u306A\u3089\u30B0\u30EB\u30FC\u30D7\u540D\u304B\u3089\u81EA\u52D5\u8A2D\u5B9A'
            }
            maxLength={2}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Color picker */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {'\u30A2\u30A4\u30B3\u30F3\u306E\u8272'}
          </label>
          <div className="flex flex-wrap gap-2">
            {AVATAR_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setIconColor(color)}
                className={`h-10 w-10 rounded-full border-2 transition-transform ${
                  iconColor === color ? 'scale-110 border-gray-800' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`${'\u8272'}: ${color}`}
                aria-pressed={iconColor === color}
              />
            ))}
          </div>
        </div>

        {/* Friend selection */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {'\u30E1\u30F3\u30D0\u30FC\u3092\u9078\u629E'}
            {selectedIds.length > 0 && (
              <span className="ml-2 text-xs text-blue-500">
                {`${String(selectedIds.length)}\u4EBA\u9078\u629E\u4E2D`}
              </span>
            )}
          </label>

          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
          )}

          {!isLoading && friends.length === 0 && error === null && (
            <div className="py-6 text-center text-sm text-gray-500">
              {'\u30D5\u30EC\u30F3\u30C9\u304C\u3044\u307E\u305B\u3093'}
            </div>
          )}

          {!isLoading && friends.length > 0 && (
            <div className="space-y-1 rounded-xl border border-gray-200 bg-white p-2">
              {friends.map((friend) => (
                <FriendCheckItem
                  key={friend.id}
                  friend={friend}
                  isSelected={selectedIds.includes(friend.id)}
                  onToggle={() => handleToggleFriend(friend.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Create button */}
        <button
          type="button"
          onClick={() => {
            void handleCreate()
          }}
          disabled={!canCreate}
          className="w-full rounded-lg bg-blue-500 py-3 font-bold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isCreating ? '\u4F5C\u6210\u4E2D...' : '\u30B0\u30EB\u30FC\u30D7\u3092\u4F5C\u6210'}
        </button>
      </div>
    </div>
  )
}

/**
 * Friend selection checkbox item
 */
function FriendCheckItem({
  friend,
  isSelected,
  onToggle,
}: {
  readonly friend: Profile
  readonly isSelected: boolean
  readonly onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors ${
        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
      }`}
      aria-pressed={isSelected}
    >
      {/* Checkbox */}
      <div
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
          isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'
        }`}
      >
        {isSelected && <CheckIcon />}
      </div>

      {/* Avatar */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
        style={{ backgroundColor: friend.avatar_color }}
      >
        {friend.avatar_text}
      </div>

      {/* Name */}
      <span className="truncate font-medium text-gray-800">{friend.display_name}</span>
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

/**
 * Checkmark SVG icon
 */
function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2.5 6L5 8.5L9.5 3.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
