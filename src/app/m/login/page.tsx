'use client'

import { useState, useEffect, type FormEvent } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

/**
 * Login page - completely independent from AuthContext.
 * Uses Supabase client directly to avoid internal auth lock contention
 * with the layout's session check.
 */
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Clear any stale session to release Supabase internal auth lock
  useEffect(() => {
    void supabase.auth.signOut()
  }, [])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(
          authError.message === 'Invalid login credentials'
            ? 'メールアドレスまたはパスワードが間違っています'
            : authError.message
        )
        return
      }

      // Set cookie for middleware
      document.cookie = 'sb-auth-status=1; path=/; max-age=31536000; SameSite=Lax'

      // Full page reload to re-initialize layout auth state cleanly
      window.location.href = '/m'
      return
    } catch {
      setError('ログインに失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

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
          <h2 className="mb-6 text-center text-xl font-bold text-gray-800">ログイン</h2>

          {error !== null && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              メールアドレス
            </label>
            <input
              id="email"
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
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="6文字以上"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-500 py-3 font-bold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'ログイン中...' : 'ログイン'}
          </button>

          <p className="mt-4 text-center text-sm text-gray-600">
            アカウントをお持ちでない方は{' '}
            <Link href="/m/signup" className="font-medium text-blue-500 hover:text-blue-600">
              新規登録
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
