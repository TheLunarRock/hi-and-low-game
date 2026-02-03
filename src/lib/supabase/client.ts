'use client'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (
  supabaseUrl === undefined ||
  supabaseUrl === '' ||
  supabaseAnonKey === undefined ||
  supabaseAnonKey === ''
) {
  throw new Error(
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
  )
}

/**
 * Supabase client for client-side usage
 * Use this in React components and client-side code
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
