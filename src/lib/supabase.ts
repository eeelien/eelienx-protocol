import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client (bypasses RLS — solo usar en API routes)
export const supabaseAdmin = createClient(url, serviceKey);
