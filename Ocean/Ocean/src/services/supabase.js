import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG } from '@/config/api'

export const supabase = createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY)
