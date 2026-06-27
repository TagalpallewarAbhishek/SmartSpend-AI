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

    // 1. Check if the user already exists
    const { data: existingUser } = await supabase
      .from('users_credential')
      .select('username')
      .eq('username', cleanUsername)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'Identity Conflict: Username is already taken.' }, { status: 400 });
    }

    // 2. Hash the password with a salt round of 10
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Insert the SECURE hashed password into PostgreSQL
    const { error: insertError } = await supabase
      .from('users_credential')
      .insert([{ username: cleanUsername, password: hashedPassword }]);

    if (insertError) throw insertError;

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