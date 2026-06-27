import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import bcrypt from 'bcryptjs'; // 👈 Import bcrypt

export async function POST(request) {
  try {
    const { email: username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();

    // 1. Fetch the user profile row
    const { data: profile, error } = await supabase
      .from('users_credential')
      .select('*')
      .eq('username', cleanUsername)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'Invalid username or password configuration.' }, { status: 401 });
    }

    // 2. Use bcrypt to safely compare the typed password with the encrypted hash
    const isPasswordValid = await bcrypt.compare(password, profile.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid username or password configuration.' }, { status: 401 });
    }

    return NextResponse.json({ 
      user: { 
        id: `user_id_${cleanUsername}`, 
        email: `${cleanUsername}@smartspend.local`,
        user_metadata: { username: cleanUsername }
      } 
    }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}