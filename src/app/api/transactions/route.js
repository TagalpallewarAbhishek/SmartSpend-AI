import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// ----------------------------------------------------
// 📥 GET HANDLER: Fetch transactions for the unique user
// ----------------------------------------------------
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = request.headers.get('x-user-id') || searchParams.get('userId');

    let query = supabase.from('transactions').select('*');

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      return NextResponse.json({ transactions: [] }, { status: 200 });
    }

    const { data: transactions, error } = await query.order('transaction_date', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ transactions }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ----------------------------------------------------
// 📤 POST HANDLER: Create a new transaction for the user
// ----------------------------------------------------
export async function POST(request) {
  try {
    const body = await request.json();
    const { user_id, amount, type, category, description, transaction_date } = body;

    // 🛑 1. Operational Verification Guard rails
    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json(
        { error: 'Validation Error: Transaction amount must be strictly greater than zero.' },
        { status: 400 }
      );
    }

    if (!user_id) {
      return NextResponse.json(
        { error: 'Validation Error: Missing unique user registration context identity token.' },
        { status: 400 }
      );
    }

    // 💾 2. Talk to the database via our Supabase client wrapper
    const { data: newTransaction, error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id,
          amount: parseFloat(amount),
          type,
          category: category ? category.toLowerCase().trim() : 'others',
          description: description || 'Miscellaneous Entry',
          transaction_date: transaction_date || new Date().toISOString().split('T')[0]
        }
      ])
      .select()
      .single();

    // 🚨 3. Handle data execution errors
    if (error) {
      console.error('PostgreSQL Database Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 🎉 4. Respond back to your frontend with a clean 201 HTTP success status
    return NextResponse.json({ transaction: newTransaction }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ----------------------------------------------------
// ❌ DELETE HANDLER: Remove a transaction record row
// ----------------------------------------------------
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing identification parameter.' }, { status: 400 });
    }

    const { error } = await supabase.from('transactions').delete().eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}