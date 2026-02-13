'use client'

import { createClient } from '@supabase/supabase-js'

import type { Database } from './database.types'

function getSupabaseConfig(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (url === undefined || url === '' || key === undefined || key === '') {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
    )
  }

  return { url, key }
}

const config = getSupabaseConfig()

/**
 * Supabase client singleton for client-side usage.
 * Module-level instantiation ensures a single GoTrue instance in React.
 */
export const supabase = createClient<Database>(config.url, config.key)

/**
 * Returns the singleton Supabase client.
 * Backward-compatible factory function alias.
 */
export function createBrowserClient() {
  return supabase
}
