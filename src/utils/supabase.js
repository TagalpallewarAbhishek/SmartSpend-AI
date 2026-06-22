import { createClient } from '@supabase/supabase-js';

// Retrieve values from the local environment lockbox (.env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fail-Safe Bouncer: Guard against silent database connectivity drops
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'CRITICAL DATABASE ERROR: Supabase environment credentials are missing inside .env.local. ' +
    'Please check your project keys on the Supabase Dashboard.'
  );
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey);