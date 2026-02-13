import { createClient } from '@supabase/supabase-js'

import type { Database } from './database.types'

/**
 * Create a Supabase client for server-side usage
 * Use this in Server Components, Route Handlers, and Server Actions
 */
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (
    supabaseUrl === undefined ||
    supabaseUrl === '' ||
    supabaseAnonKey === undefined ||
    supabaseAnonKey === ''
  ) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}
