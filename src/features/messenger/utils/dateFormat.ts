/**
 * 日付フォーマットユーティリティ（Asia/Tokyo固定）
 */

import { DATE_TIMEZONE } from '../constants'

const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'] as const

/**
 * メッセージの時刻表示（HH:MM）
 */
export function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('ja-JP', {
    timeZone: DATE_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/**
 * 日付セパレータ表示（2026年2月13日(木)）
 */
export function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr)
  const formatted = date.toLocaleDateString('ja-JP', {
    timeZone: DATE_TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const tokyoDate = new Date(date.toLocaleString('en-US', { timeZone: DATE_TIMEZONE }))
  const dayName = DAY_NAMES[tokyoDate.getDay()]
  return `${formatted}(${dayName})`
}

/**
 * 会話一覧の時刻表示
 * 今日 → HH:MM、昨日 → 昨日、それ以前 → M/D
 */
export function formatConversationTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()

  const tokyoNow = new Date(now.toLocaleString('en-US', { timeZone: DATE_TIMEZONE }))
  const tokyoDate = new Date(date.toLocaleString('en-US', { timeZone: DATE_TIMEZONE }))

  const todayStart = new Date(tokyoNow.getFullYear(), tokyoNow.getMonth(), tokyoNow.getDate())
  const yesterdayStart = new Date(todayStart.getTime() - 86400000)

  if (tokyoDate >= todayStart) {
    return formatMessageTime(dateStr)
  }
  if (tokyoDate >= yesterdayStart) {
    return '昨日'
  }
  return date.toLocaleDateString('ja-JP', {
    timeZone: DATE_TIMEZONE,
    month: 'numeric',
    day: 'numeric',
  })
}

/**
 * 2つの日付が同じ日かどうか（Tokyo時間）
 */
export function isSameDay(dateStr1: string, dateStr2: string): boolean {
  const d1 = new Date(new Date(dateStr1).toLocaleString('en-US', { timeZone: DATE_TIMEZONE }))
  const d2 = new Date(new Date(dateStr2).toLocaleString('en-US', { timeZone: DATE_TIMEZONE }))
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}
