'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile, AuthState } from '../types'

interface UseAuthReturn extends AuthState {
  signUp: (
    email: string,
    password: string,
    displayName: string,
    avatarColor?: string
  ) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (updates: {
    display_name?: string
    avatar_color?: string
    avatar_text?: string
  }) => Promise<void>
  error: string | null
  clearError: () => void
}

/**
 * Check localStorage synchronously for a Supabase session token.
 * If no token exists, the user is definitely not authenticated
 * and we can skip the loading spinner entirely.
 */
function hasStoredSession(): boolean {
  if (typeof window === 'undefined') return true // SSR: assume loading
  try {
    return Object.keys(localStorage).some((k) => k.startsWith('sb-') && k.endsWith('-auth-token'))
  } catch {
    return true // If localStorage is blocked, assume loading
  }
}

/** Set a lightweight cookie flag so middleware can check auth without JS */
function setAuthCookie(authenticated: boolean): void {
  if (typeof document === 'undefined') return
  if (authenticated) {
    document.cookie = 'sb-auth-status=1; path=/; max-age=31536000; SameSite=Lax'
  } else {
    document.cookie = 'sb-auth-status=; path=/; max-age=0'
  }
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(hasStoredSession)
  const [error, setError] = useState<string | null>(null)

  // Check current session on mount
  useEffect(() => {
    let isMounted = true

    async function checkSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user != null && isMounted) {
          setAuthCookie(true)
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- isMounted can change across await
          if (isMounted) {
            setUser(profile ?? null)
          }
        }
        // Cookie is only cleared by explicit logout handler.
        // Clearing here races with login page setting the cookie.
      } catch {
        // Session check failed silently
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void checkSession()

    // Safety timeout: ensure isLoading becomes false even if session check hangs
    const timeout = setTimeout(() => {
      if (isMounted) setIsLoading(false)
    }, 3000)

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return

      if (event === 'SIGNED_IN' && session?.user !== undefined) {
        setAuthCookie(true)
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- isMounted can change across await
        if (isMounted) {
          setUser(profile ?? null)
          setIsLoading(false)
        }
      } else if (event === 'SIGNED_OUT') {
        // Cookie is cleared explicitly by logout handler, not here.
        // Clearing here causes race condition with login page's signOut() on mount.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- isMounted can change across await
        if (isMounted) {
          setUser(null)
          setIsLoading(false)
        }
      }
    })

    return () => {
      isMounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const handleSignUp = useCallback(
    async (email: string, password: string, displayName: string, avatarColor?: string) => {
      setError(null)
      setIsLoading(true)
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
          },
        })

        if (authError) {
          throw new Error(authError.message)
        }

        if (authData.user === null) {
          throw new Error('登録に失敗しました')
        }

        setAuthCookie(true)

        // Wait for trigger to create profile
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // If custom avatar color provided, update profile
        if (avatarColor !== undefined) {
          const { data: updatedProfile } = await supabase
            .from('profiles')
            .update({ avatar_color: avatarColor })
            .eq('id', authData.user.id)
            .select('*')
            .single()

          if (updatedProfile !== null) {
            setUser(updatedProfile)
            return
          }
        }

        // Fetch profile with trigger defaults
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single()

        setUser(profile ?? null)
      } catch (err) {
        const message = err instanceof Error ? err.message : '登録に失敗しました'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const handleLogin = useCallback(async (email: string, password: string) => {
    setError(null)
    setIsLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        throw new Error(authError.message)
      }

      setAuthCookie(true)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      setUser(profile ?? null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ログインに失敗しました'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleLogout = useCallback(async () => {
    setError(null)
    try {
      setAuthCookie(false)
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        throw new Error(signOutError.message)
      }
      setUser(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ログアウトに失敗しました'
      setError(message)
    }
  }, [])

  const handleUpdateProfile = useCallback(
    async (updates: { display_name?: string; avatar_color?: string; avatar_text?: string }) => {
      if (user === null) return
      setError(null)
      try {
        const { data: profile, error: updateError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)
          .select('*')
          .single()

        if (updateError) {
          throw new Error('プロフィールの更新に失敗しました')
        }

        setUser(profile)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'プロフィールの更新に失敗しました'
        setError(message)
      }
    },
    [user]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const isAuthenticated = user !== null

  return useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      signUp: handleSignUp,
      login: handleLogin,
      logout: handleLogout,
      updateProfile: handleUpdateProfile,
      error,
      clearError,
    }),
    [
      user,
      isLoading,
      isAuthenticated,
      handleSignUp,
      handleLogin,
      handleLogout,
      handleUpdateProfile,
      error,
      clearError,
    ]
  )
}
