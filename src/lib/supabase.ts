import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

export const supabase = (() => {
    if (supabaseInstance) return supabaseInstance

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        // Return a proxy that throws meaningful errors at runtime
        // but doesn't crash during build time
        return new Proxy({} as SupabaseClient, {
            get(_, prop) {
                if (prop === 'then') return undefined
                throw new Error(
                    'Supabase client is not initialized. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables are set.'
                )
            },
        })
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
    return supabaseInstance
})()
