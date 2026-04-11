/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
const { data, error } = await supabase.functions.invoke('live-scores', {
  body: { name: 'Functions' },
})

VITE_SUPABASE_URL=https://plgupdwglfopxjoxwyys.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_e5Q0hbZxDsUPwJ5mHoXnDQ_hjevBy-s
