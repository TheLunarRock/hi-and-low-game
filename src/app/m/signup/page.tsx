'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { AVATAR_COLORS } from '@/features/messenger'

/**
 * Signup page - completely independent from AuthContext.
 * Uses Supabase client directly to avoid internal auth lock contention.
 */
export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [selectedColor, setSelectedColor] = useState<string>(AVATAR_COLORS[0])
  const [step, setStep] = useState<'credentials' | 'profile'>('credentials')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleCredentials(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStep('profile')
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Clear any stale session first (awaited to ensure lock is released)
      await supabase.auth.signOut()

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
        },
      })

      if (authError) {
        setError(authError.message)
        setStep('credentials')
        return
      }

      if (authData.user === null) {
        setError('登録に失敗しました')
        setStep('credentials')
        return
      }

      // Wait for trigger to create profile
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update avatar color
      await supabase
        .from('profiles')
        .update({ avatar_color: selectedColor })
        .eq('id', authData.user.id)

      // Set cookie for middleware, then full page reload
      document.cookie = 'sb-auth-status=1; path=/; max-age=31536000; SameSite=Lax'
      window.location.href = '/m'
    } catch {
      setError('登録に失敗しました')
      setStep('credentials')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (step === 'profile') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-500 to-blue-700 px-4">
        <div className="w-full max-w-sm">
          <h1 className="mb-8 text-center text-3xl font-bold text-white">メッセンジャー</h1>

          <form
            onSubmit={(e) => {
              void handleSubmit(e)
            }}
            className="rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="mb-6 text-center text-xl font-bold text-gray-800">プロフィール設定</h2>

            {error !== null && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}

            {/* Avatar preview */}
            <div className="mb-6 flex justify-center">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
                style={{ backgroundColor: selectedColor }}
              >
                {displayName.slice(0, 2) || '?'}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-gray-700">
                表示名
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                maxLength={20}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="表示名を入力"
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">アイコンの色</label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`h-10 w-10 rounded-full border-2 transition-transform ${
                      selectedColor === color ? 'scale-110 border-gray-800' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`色: ${color}`}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || displayName.trim() === ''}
              className="w-full rounded-lg bg-blue-500 py-3 font-bold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? '登録中...' : '登録する'}
            </button>

            <button
              type="button"
              onClick={() => setStep('credentials')}
              className="mt-3 w-full rounded-lg py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              戻る
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-500 to-blue-700 px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-3xl font-bold text-white">メッセンジャー</h1>

        <form onSubmit={handleCredentials} className="rounded-2xl bg-white p-6 shadow-xl">
          <h2 className="mb-6 text-center text-xl font-bold text-gray-800">新規登録</h2>

          {error !== null && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <div className="mb-4">
            <label htmlFor="signupEmail" className="mb-1 block text-sm font-medium text-gray-700">
              メールアドレス
            </label>
            <input
              id="signupEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="example@email.com"
              autoComplete="email"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="signupPassword"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              パスワード
            </label>
            <input
              id="signupPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="6文字以上"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={email.trim() === '' || password.length < 6}
            className="w-full rounded-lg bg-blue-500 py-3 font-bold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            次へ
          </button>

          <p className="mt-4 text-center text-sm text-gray-600">
            既にアカウントをお持ちの方は{' '}
            <Link href="/m/login" className="font-medium text-blue-500 hover:text-blue-600">
              ログイン
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
