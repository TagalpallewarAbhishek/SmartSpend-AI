import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST() {
  await supabase.auth.signOut();
  return NextResponse.json({ success: true }, { status: 200 });
}