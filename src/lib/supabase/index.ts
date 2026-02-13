/**
 * Supabase client exports
 *
 * Client-side: import { supabase, createBrowserClient } from '@/lib/supabase'
 * Server-side: import { createServerSupabaseClient } from '@/lib/supabase'
 * Types: import type { Database } from '@/lib/supabase'
 */

export { supabase, createBrowserClient } from './client'
export { createServerSupabaseClient } from './server'
export type { Database } from './database.types'
