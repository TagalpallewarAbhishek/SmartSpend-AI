import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(request) {
  try {
    const { email: username, password } = await request.json();

    // 🛑 Guard rail: Ensure credentials are pass in completely
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    } // 👈 This closing brace was missing or misaligned!

   const cleanUsername = username.trim().toLowerCase();
    
    // 📧 Match the exact same gmail structure for database query lookups
    const perfectEmail = `${cleanUsername}.smartspend@gmail.com`;

    // 🔑 Pass credentials to the Supabase authentication engine
    const { data, error } = await supabase.auth.signInWithPassword({
      email: perfectEmail,
      password,
    });

    if (error) throw error;

    // 🎉 Success: Send the authenticated user object back to your frontend
    return NextResponse.json({ user: data.user }, { status: 200 });

  } catch (err) {
    console.error('Login Route Exception Fault:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}