'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/features/messenger'

/**
 * Minimum characters required before triggering a search
 */
const MIN_QUERY_LENGTH = 2

/**
 * Debounce delay in milliseconds
 */
const DEBOUNCE_MS = 300

/**
 * Maximum number of search results to return
 */
const MAX_RESULTS = 50

/**
 * Sender profile from Supabase join
 */
interface SenderProfile {
  readonly display_name: string
  readonly avatar_text: string
  readonly avatar_color: string
}

/**
 * A single search result returned from the messages query
 */
interface SearchResult {
  readonly id: string
  readonly content: string | null
  readonly conversation_id: string
  readonly sender_id: string
  readonly created_at: string
  readonly sender: SenderProfile | null
}

/**
 * Timezone for formatting dates
 */
const TZ = 'Asia/Tokyo'

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const tokyoNow = new Date(now.toLocaleString('en-US', { timeZone: TZ }))
  const tokyoDate = new Date(date.toLocaleString('en-US', { timeZone: TZ }))
  const todayStart = new Date(tokyoNow.getFullYear(), tokyoNow.getMonth(), tokyoNow.getDate())
  const yesterdayStart = new Date(todayStart.getTime() - 86400000)

  if (tokyoDate >= todayStart) {
    return date.toLocaleTimeString('ja-JP', {
      timeZone: TZ,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }
  if (tokyoDate >= yesterdayStart) {
    return '\u6628\u65E5'
  }
  return date.toLocaleDateString('ja-JP', {
    timeZone: TZ,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  })
}

/**
 * Build highlighted text segments for the matched query within content.
 * Returns an array of { text, highlighted } segments.
 */
function buildHighlightSegments(
  content: string,
  query: string
): readonly { readonly text: string; readonly highlighted: boolean }[] {
  if (query.length === 0) {
    return [{ text: content, highlighted: false }]
  }

  const lowerContent = content.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const segments: { text: string; highlighted: boolean }[] = []
  let lastIndex = 0
  let searchIndex = lowerContent.indexOf(lowerQuery, lastIndex)

  while (searchIndex !== -1) {
    if (searchIndex > lastIndex) {
      segments.push({ text: content.slice(lastIndex, searchIndex), highlighted: false })
    }
    segments.push({
      text: content.slice(searchIndex, searchIndex + query.length),
      highlighted: true,
    })
    lastIndex = searchIndex + query.length
    searchIndex = lowerContent.indexOf(lowerQuery, lastIndex)
  }

  if (lastIndex < content.length) {
    segments.push({ text: content.slice(lastIndex), highlighted: false })
  }

  return segments
}

/**
 * Search messages across all conversations the user belongs to
 */
async function searchMessages(userId: string, query: string): Promise<SearchResult[]> {
  const { data: memberships } = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('user_id', userId)

  if (memberships === null || memberships.length === 0) {
    return []
  }

  const convIds = memberships.map((m) => m.conversation_id)

  const { data, error } = await supabase
    .from('messages')
    .select(
      'id, content, conversation_id, sender_id, created_at, sender:profiles!messages_sender_id_fkey(display_name, avatar_text, avatar_color)'
    )
    .in('conversation_id', convIds)
    .ilike('content', `%${query}%`)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(MAX_RESULTS)

  if (error) {
    throw new Error(error.message)
  }

  return data as unknown as SearchResult[]
}

/**
 * Back arrow icon for the header
 */
function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15 18L9 12L15 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Search icon for the input field
 */
function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Clear (X) icon for clearing the search input
 */
function ClearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/**
 * A single search result item
 */
function SearchResultItem({
  result,
  query,
  onClick,
}: {
  readonly result: SearchResult
  readonly query: string
  readonly onClick: () => void
}) {
  const senderName = result.sender?.display_name ?? '\u4E0D\u660E'
  const avatarText = result.sender?.avatar_text ?? '?'
  const avatarColor = result.sender?.avatar_color ?? '#6B7280'
  const content = result.content ?? ''
  const segments = buildHighlightSegments(content, query)
  const timeText = formatMessageTime(result.created_at)

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
        style={{ backgroundColor: avatarColor }}
      >
        {avatarText}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="truncate text-sm font-bold text-gray-800">{senderName}</p>
          <span className="shrink-0 text-xs text-gray-400">{timeText}</span>
        </div>
        <p className="mt-0.5 truncate text-sm text-gray-500">
          {segments.map((segment, index) => (
            <span
              key={`${segment.text}-${String(index)}`}
              className={segment.highlighted ? 'font-bold text-blue-600' : ''}
            >
              {segment.text}
            </span>
          ))}
        </p>
      </div>
    </button>
  )
}

/**
 * Empty state when no query has been entered
 */
function EmptyPrompt() {
  return (
    <div className="py-16 text-center">
      <p className="mb-2 text-4xl">{'\uD83D\uDD0D'}</p>
      <p className="text-gray-500">{'\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u691C\u7D22'}</p>
      <p className="mt-1 text-sm text-gray-400">
        {'\uFF12\u6587\u5B57\u4EE5\u4E0A\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044'}
      </p>
    </div>
  )
}

/**
 * Empty state when search returns no results
 */
function NoResults({ query }: { readonly query: string }) {
  return (
    <div className="py-16 text-center">
      <p className="mb-2 text-4xl">{'\uD83D\uDE45'}</p>
      <p className="text-gray-500">
        {'\u300C'}
        {query}
        {'\u300D\u306E\u691C\u7D22\u7D50\u679C\u306F\u3042\u308A\u307E\u305B\u3093'}
      </p>
      <p className="mt-1 text-sm text-gray-400">
        {
          '\u5225\u306E\u30AD\u30FC\u30EF\u30FC\u30C9\u3067\u8A66\u3057\u3066\u304F\u3060\u3055\u3044'
        }
      </p>
    </div>
  )
}

/**
 * Loading spinner
 */
function SearchLoading() {
  return (
    <div className="flex justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
    </div>
  )
}

/**
 * Error display
 */
function SearchError({ message }: { readonly message: string }) {
  return (
    <div className="mx-4 mt-4 rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">
      {message}
    </div>
  )
}

/**
 * Search results list
 */
function SearchResultsList({
  results,
  query,
  onResultClick,
}: {
  readonly results: readonly SearchResult[]
  readonly query: string
  readonly onResultClick: (conversationId: string) => void
}) {
  return (
    <div>
      <p className="px-4 py-2 text-xs text-gray-400">
        {String(results.length)}
        {'\u4EF6\u306E\u7D50\u679C'}
      </p>
      {results.map((result) => (
        <SearchResultItem
          key={result.id}
          result={result}
          query={query}
          onClick={() => onResultClick(result.conversation_id)}
        />
      ))}
    </div>
  )
}

/**
 * Search page header with back button and search input
 */
function SearchHeader({
  query,
  inputRef,
  onQueryChange,
  onClear,
}: {
  readonly query: string
  readonly inputRef: React.RefObject<HTMLInputElement | null>
  readonly onQueryChange: (value: string) => void
  readonly onClear: () => void
}) {
  return (
    <div className="sticky top-0 z-10 bg-white shadow-sm">
      <div className="flex items-center gap-2 px-2 py-2">
        <Link
          href="/m"
          className="flex shrink-0 items-center justify-center rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100"
          aria-label={'\u623B\u308B'}
        >
          <BackIcon />
        </Link>

        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
            <SearchIcon />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={'\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u691C\u7D22...'}
            className="w-full rounded-full bg-gray-100 py-2 pl-10 pr-10 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:bg-gray-200"
            autoComplete="off"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
              aria-label={'\u30AF\u30EA\u30A2'}
            >
              <ClearIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Main search page body content
 */
function SearchBody({
  query,
  debouncedQuery,
  isSearching,
  error,
  results,
  onResultClick,
}: {
  readonly query: string
  readonly debouncedQuery: string
  readonly isSearching: boolean
  readonly error: string | null
  readonly results: readonly SearchResult[]
  readonly onResultClick: (conversationId: string) => void
}) {
  if (isSearching) {
    return <SearchLoading />
  }

  if (error !== null) {
    return <SearchError message={error} />
  }

  if (debouncedQuery.length < MIN_QUERY_LENGTH) {
    return <EmptyPrompt />
  }

  if (results.length === 0) {
    return <NoResults query={debouncedQuery} />
  }

  return <SearchResultsList results={results} query={query} onResultClick={onResultClick} />
}

/**
 * Message search page
 *
 * Allows users to search through messages across all their conversations.
 * Supports debounced search with a minimum of 2 characters.
 */
export default function MessageSearchPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-focus search input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Debounce the query
  useEffect(() => {
    if (query.length < MIN_QUERY_LENGTH) {
      setDebouncedQuery('')
      setResults([])
      setError(null)
      return
    }

    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [query])

  // Execute search when debounced query changes
  useEffect(() => {
    if (user === null || debouncedQuery.length < MIN_QUERY_LENGTH) {
      return
    }

    let isCancelled = false

    async function executeSearch() {
      if (user === null) return
      setIsSearching(true)
      setError(null)

      try {
        const data = await searchMessages(user.id, debouncedQuery)
        if (!isCancelled) {
          setResults(data)
        }
      } catch {
        if (!isCancelled) {
          setError('\u691C\u7D22\u306B\u5931\u6557\u3057\u307E\u3057\u305F')
        }
      } finally {
        if (!isCancelled) {
          setIsSearching(false)
        }
      }
    }

    void executeSearch()

    return () => {
      isCancelled = true
    }
  }, [debouncedQuery, user])

  function handleResultClick(conversationId: string) {
    router.push(`/m/chat/${conversationId}`)
  }

  function handleClear() {
    setQuery('')
    setDebouncedQuery('')
    setResults([])
    setError(null)
    inputRef.current?.focus()
  }

  if (user === null) return null

  return (
    <div className="mx-auto max-w-lg">
      <SearchHeader
        query={query}
        inputRef={inputRef}
        onQueryChange={setQuery}
        onClear={handleClear}
      />

      <SearchBody
        query={query}
        debouncedQuery={debouncedQuery}
        isSearching={isSearching}
        error={error}
        results={results}
        onResultClick={handleResultClick}
      />
    </div>
  )
}
