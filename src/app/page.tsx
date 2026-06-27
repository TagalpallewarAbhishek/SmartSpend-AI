'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, ArrowUpRight, ArrowDownRight, Wallet, ReceiptIndianRupee, Tag, Trash2, Sparkles, FolderPlus, PieChart as ChartIcon } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export default function Home() {
  // Form State Values
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('food');
  const [description, setDescription] = useState('');
  
  // UI Status Tracking
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ success: null, message: '' });

  // INTERACTIVE FILTER STATES
  const [selectedDay, setSelectedDay] = useState(null); 
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(null); 

  // Data storage arrays
  const [localLedger, setLocalLedger] = useState([]);

  // DYNAMIC CATEGORIES LIST STATE (Predefined + Custom Category Management)
  const [customCategories, setCustomCategories] = useState([
    { id: 'food', name: '🍔 Food & Canteen' },
    { id: 'travel', name: '🚗 Travel / Auto' },
    { id: 'entertainment', name: '🎬 Entertainment / OTT' },
    { id: 'academics', name: '📚 Books & Academics' },
    { id: 'others', name: '💡 Other / Unclassified' }
  ]);
  const [newCategoryName, setNewCategoryName] = useState('');

  // DYNAMIC BUDGET LIMITS STATE
  const [categoryBudgets, setCategoryBudgets] = useState({
    food: 3000,
    travel: 1500,
    entertainment: 2000,
    academics: 4000,
    others: 2000
  });

  // AUTHENTICATION STATES
  const [user, setUser] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // MATH ENGINE: Compute real-time running metrics out of our active data stream array
  const totalIncome = localLedger
    .filter(item => item.type === 'income')
    .reduce((sum, item) => sum + parseFloat(item.amount), 0);

  const totalExpenses = localLedger
    .filter(item => item.type === 'expense')
    .reduce((sum, item) => sum + parseFloat(item.amount), 0);

  const totalBalance = totalIncome - totalExpenses;

  // DYNAMIC GLOBAL BUDGET SUM CALCULATOR
  const totalMonthlyAllocatedBudget = customCategories.reduce((sum, cat) => {
    return sum + (categoryBudgets[cat.id] || 0);
  }, 0);

  // Hydrate transactions on startup
  useEffect(() => {
    const fetchHistoricLedger = async () => {
      if (!user?.id) return; // Don't run a fetch pass if no one is logged in
      
      try {
        // Pass the user id via query parameters cleanly
        const response = await fetch(`/api/transactions?userId=${user.id}`);
        const result = await response.json();
        if (response.ok) {
          const normalized = (result.transactions || []).map(t => ({
            ...t,
            category: t.category ? t.category.toLowerCase().trim() : 'others',
            date: t.transaction_date || t.date
          }));
          setLocalLedger(normalized);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };
    fetchHistoricLedger();
  }, [user]); // Fires instantly whenever a session user token changes; // Re-fetch data if user logs in/out

  // Dynamic Session Tracking Listener
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          if (data.user) setUser(data.user);
        }
      } catch (err) {
        console.error('Session monitoring token error:', err);
      }
    };
    checkActiveSession();
  }, []);

  // Handle Custom Category Creation
  const handleAddCustomCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const formattedId = newCategoryName.trim().toLowerCase();
    
    if (customCategories.some(cat => cat.id === formattedId)) {
      alert('This category profile already exists!');
      return;
    }

    setCustomCategories([
      ...customCategories,
      { id: formattedId, name: `📦 ${newCategoryName.trim()}` }
    ]);
    
    setCategoryBudgets({
      ...categoryBudgets,
      [formattedId]: 2000 
    });

    setNewCategoryName('');
  };
const handleAuthenticationAction = async (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;

    setAuthLoading(true);
    const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';

    try {
      // 📡 Pass inputs back to our true backend server script engines
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      });
      const result = await response.json();

      if (response.ok && result.user) {
        // Only set session if backend explicitly verifies credentials
        setUser(result.user);
      } else {
        // Show validation or conflict errors (e.g., username taken, wrong password)
        alert(`Authentication Error: ${result.error || 'Invalid credentials token configuration.'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network transmission failed during security authorization pass.');
    } finally {
      setAuthLoading(false);
    }
  };
      const cleanUsername = authEmail.trim().toLowerCase();
    
  const handleSignOutAction = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setLocalLedger([]);
  };

  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setStatus({ success: false, message: 'Please enter a valid amount greater than 0.' });
      return;
    }

    setLoading(true);
    setStatus({ success: null, message: 'Processing transaction data...' });

  const targetCategory = category.toLowerCase().trim();
    const transactionData = {
      user_id: user?.id, // 👈 Remapped to use the user's specific unique username ID string
      amount: parseFloat(amount),
      type,
      category: targetCategory, 
      description: description || 'Miscellaneous Entry',
      transaction_date: new Date().toISOString().split('T')[0]
    };

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ success: true, message: 'Transaction securely added to PostgreSQL cloud!' });
        
        const newRow = {
          id: result.transaction?.id || Math.random().toString(),
          amount: result.transaction?.amount || transactionData.amount,
          type: result.transaction?.type || transactionData.type,
          category: targetCategory,
          description: result.transaction?.description || transactionData.description,
          date: result.transaction?.transaction_date || transactionData.transaction_date
        };

        setLocalLedger([newRow, ...localLedger]);
        setAmount('');
        setDescription('');
      } else {
        setStatus({ success: false, message: `Server Rejected: ${result.error}` });
      }
    } catch (err) {
      setStatus({ success: false, message: 'Network Timeout: Failed to reach API node.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!confirm('Are you sure you want to remove this transaction entry?')) return;
    try {
      const response = await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setLocalLedger(localLedger.filter((item) => item.id !== id));
      }
    } catch (err) {
      alert('Network error: Could not reach server.');
    }
  };
  const [aiAnalysis, setAiAnalysis] = useState('');
const [aiLoading, setAiLoading] = useState(false);

  const handleTriggerAiConsultation = async () => {
    setAiLoading(true);
    setAiAnalysis('');
    try {
      // 🔒 FIXED: Extract the raw string ID directly from your session state object
      const targetUserId = user?.id; 

      if (!targetUserId) {
        setAiAnalysis('❌ Session Error: No active isolation user ID found.');
        setAiLoading(false);
        return;
      }

      // 🔄 Hit the updated POST endpoint and pass the isolation token in the request body
      const response = await fetch('/api/ai-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: targetUserId }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setAiAnalysis(result.analysis);
      } else {
        setAiAnalysis(`❌ Server Refused Request: ${result.error || 'Unknown Error'}`);
      }
    } catch (err) {
      setAiAnalysis('❌ Network Handshake Failure.');
    } finally {
      setAiLoading(false);
    }
  };

  // PREPARE PIE CHART DATA AGGREGATIONS
  const chartColors = ['#f59e0b', '#38bdf8', '#ec4899', '#a855f7', '#64748b', '#10b981', '#f43f5e', '#6366f1'];
  const pieChartData = customCategories.map((cat) => {
    const spent = localLedger
      .filter(item => item.type === 'expense' && item.category === cat.id)
      .reduce((sum, item) => sum + parseFloat(item.amount), 0);
    return { name: cat.id.toUpperCase(), value: spent };
  }).filter(item => item.value > 0);

  // GATEWAY RENDER 1: Unauthenticated portal viewport lock override
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans antialiased">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/10 mb-2">
              <Wallet className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Welcome to SmartSpend AI</h1>
            <p className="text-xs text-slate-400 font-sans">Secure engineering portal login</p>
          </div>

         <form onSubmit={handleAuthenticationAction} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">Account Username</label>
              <input 
                type="text" 
                required 
                placeholder="e.g., abhishek123" 
                value={authEmail} 
                onChange={(e) => setAuthEmail(e.target.value)} 
                suppressHydrationWarning={true} // 👈 Silences extension tags injection crashes
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono" 
              /> {/* 👈 Crucial: Self-closing tag fixed */}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">Account Password</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••" 
                value={authPassword} 
                onChange={(e) => setAuthPassword(e.target.value)} 
                suppressHydrationWarning={true} // 👈 Silences extension tags injection crashes
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono" 
              /> {/* 👈 Crucial: Self-closing tag fixed */}
            </div>

            <button 
              type="submit" 
              disabled={authLoading} 
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wide transition-all shadow-md active:scale-98 disabled:opacity-50"
            >
              {authLoading ? 'Authorizing Secure Sync...' : isSignUp ? 'Create Cloud Account' : 'Secure Authorization Login'}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-800/60">
            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-xs text-indigo-400 hover:underline font-medium">
              {isSignUp ? 'Already have an active ledger sync? Sign In' : "Don't have an account? Register Profile Token"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // GATEWAY RENDER 2: Verified session dashboard desktop hub layout view
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* GLOBAL NAVIGATION HEADER */}
      <header className="border-b border-slate-900 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-emerald-400 tracking-tight">
            <Wallet className="h-6 w-6 text-emerald-400" />
            SmartSpend <span className="text-xs text-slate-500 font-mono bg-slate-950 px-2 py-0.5 rounded-full border border-slate-900">v1.0</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <div className="hidden sm:flex items-center gap-2">
              <span>Sync Channel:</span>
              <span className="font-mono text-xs text-slate-300 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md truncate max-w-[150px]">{user.email}</span>
            </div>
            <button 
              onClick={handleSignOutAction}
              className="text-xs font-bold text-rose-400 hover:text-white bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 px-3 py-1.5 rounded-xl transition-all"
            >
              Disconnect
            </button>
          </div>
        </div>
      </header>

      {/* ANALYTICS METRICS DASHBOARD CARD HUB */}
      <section className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Net Liquid Balance</span>
          <div className={`text-xl font-mono font-bold tracking-tight ${totalBalance >= 0 ? 'text-white' : 'text-rose-400'}`}>
            {totalBalance < 0 ? '-' : ''}₹{Math.abs(totalBalance).toFixed(2)}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Total Capital Inflow</span>
          <div className="text-xl font-mono font-bold text-emerald-400 tracking-tight">+₹{totalIncome.toFixed(2)}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Aggregate Capital Burn</span>
          <div className="text-xl font-mono font-bold text-rose-400 tracking-tight">-₹{totalExpenses.toFixed(2)}</div>
        </div>
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/20 rounded-2xl p-5 shadow-md">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 block mb-1">Total Monthly Budget Cap</span>
          <div className="text-xl font-mono font-bold text-indigo-300 tracking-tight">₹{totalMonthlyAllocatedBudget.toFixed(0)}</div>
        </div>
      </section>

      {/* MAIN LAYOUT STRUCTURE SPLIT */}
      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* COLUMN 1: FORM CONTROLS & UTILITIES */}
        <div className="space-y-6 md:col-span-1">
          <section className="bg-slate-900 rounded-2xl border border-slate-800/60 p-6 shadow-xl h-fit space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-emerald-400" /> Log New Transaction
            </h2>
            
            <form onSubmit={handleSubmitTransaction} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">Transaction Type</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button type="button" onClick={() => setType('expense')} className={`py-1.5 text-xs rounded-lg transition-all ${type === 'expense' ? 'bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30' : 'text-slate-400'}`}>Expense</button>
                  <button type="button" onClick={() => setType('income')} className={`py-1.5 text-xs rounded-lg transition-all ${type === 'income' ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30' : 'text-slate-400'}`}>Income</button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-950 rounded-xl border border-slate-800 px-3 py-2 text-white focus:outline-none text-xs font-medium">
                  {customCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">Amount (INR)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><ReceiptIndianRupee className="h-4 w-4" /></div>
                  <input type="number" step="0.01" required placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-950 rounded-xl border border-slate-800 pl-9 pr-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">Description</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Tag className="h-4 w-4" /></div>
                  <input type="text" placeholder="e.g., Books buy, Gym protein" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-950 rounded-xl border border-slate-800 pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" />
                </div>
              </div>

              {status.message && <div className={`p-2.5 rounded-xl text-xs border ${status.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>{status.message}</div>}

              <button type="submit" disabled={loading} className={`w-full py-2.5 rounded-xl text-xs font-semibold shadow-lg transition-all ${loading ? 'bg-slate-800 text-slate-500' : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold'}`}>
                {loading ? 'Committing data...' : 'Record Entry'}
              </button>
            </form>
          </section>

          {/* DYNAMIC NEW CATEGORY ADDER */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800/60 p-5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <FolderPlus className="h-4 w-4 text-indigo-400" /> Add Custom Category
            </h3>
            <form onSubmit={handleAddCustomCategory} className="flex gap-2">
              <input type="text" placeholder="e.g., Medicine, Subscriptions" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" />
              <button type="submit" className="bg-indigo-500/10 hover:bg-indigo-500 border border-indigo-500/30 text-indigo-300 hover:text-slate-950 px-3 rounded-xl text-xs font-bold transition-all">Create</button>
            </form>
          </div>
        </div>

        {/* COLUMN 2 & 3: MAIN TRACKERS, METRIC CHARTS, AND LEDGER */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* BUDGET TARGET MANAGEMENT PANEL */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex flex-col gap-1 border-b border-slate-800 pb-2 mb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Budget Targets Adjuster</h3>
                  {selectedCategoryFilter && (
                    <button onClick={() => setSelectedCategoryFilter(null)} className="text-[10px] text-indigo-400 font-medium hover:underline">Clear Filter</button>
                  )}
                </div>
                <span className="text-[10px] text-slate-500">Click any row below to filter your table log date-wise</span>
              </div>

              <div className="flex items-center gap-1.5 mb-4 bg-slate-950 p-1.5 rounded-xl border border-slate-800/60">
                <select id="budgetCategorySelect" className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-0.5 text-[11px] text-slate-300 focus:outline-none">
                  {customCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.id}</option>)}
                </select>
                <input type="number" placeholder="New Cap" id="budgetCapInputField" className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 py-0.5 text-[11px] font-mono text-white focus:outline-none focus:border-indigo-500" onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const cat = document.getElementById('budgetCategorySelect').value;
                    const val = parseFloat(e.currentTarget.value);
                    if (val && val > 0) {
                      setCategoryBudgets({ ...categoryBudgets, [cat]: val });
                      e.currentTarget.value = '';
                    }
                  }
                }} />
              </div>
              
              <div className="space-y-3.5">
                {customCategories.map((bgt) => {
                  const activeLimit = categoryBudgets[bgt.id] || 2000;
                  const totalSpentOnCategory = localLedger.filter(item => item.category === bgt.id).reduce((sum, item) => sum + parseFloat(item.amount), 0);
                  const expenseSpentOnly = localLedger.filter(item => item.type === 'expense' && item.category === bgt.id).reduce((sum, item) => sum + parseFloat(item.amount), 0);
                  const percentage = Math.min((expenseSpentOnly / activeLimit) * 100, 100);
                  const isCoreCategory = ['food', 'travel', 'entertainment', 'academics', 'others'].includes(bgt.id);
                  const isSafeToDelete = !isCoreCategory && totalSpentOnCategory === 0;

                  return (
                    <div key={bgt.id} className={`space-y-1 group/cat cursor-pointer p-1 rounded-lg transition-all ${selectedCategoryFilter === bgt.id ? 'bg-indigo-950/40 ring-1 ring-indigo-500/30' : 'hover:bg-slate-950/20'}`}>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5" onClick={() => setSelectedCategoryFilter(selectedCategoryFilter === bgt.id ? null : bgt.id)}>
                          <span className="font-medium text-slate-300">{bgt.name}</span>
                          {isSafeToDelete && (
                            <button type="button" onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Drop "${bgt.id}" category?`)) {
                                setCustomCategories(customCategories.filter(c => c.id !== bgt.id));
                                if (category === bgt.id) setCategory('food');
                              }
                            }} className="text-[9px] bg-slate-950 text-slate-500 hover:text-rose-400 px-1 rounded">Drop</button>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-400" onClick={() => setSelectedCategoryFilter(selectedCategoryFilter === bgt.id ? null : bgt.id)}>₹{expenseSpentOnly.toFixed(0)}/<span className="text-slate-500 font-sans">₹{activeLimit}</span></span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/40" onClick={() => setSelectedCategoryFilter(selectedCategoryFilter === bgt.id ? null : bgt.id)}>
                        <div className={`h-full transition-all duration-500 rounded-full ${percentage >= 90 ? 'bg-rose-500' : percentage >= 75 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* INTERACTIVE DATA RECHARTS PIE EXPENSE BREAKDOWN MODULE */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
              <div className="border-b border-slate-800 pb-2 mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ChartIcon className="h-4 w-4 text-emerald-400" /> Capital Allocation Breakdowns
                </h3>
              </div>
              
              <div className="w-full h-44 flex items-center justify-center font-mono">
                {pieChartData.length === 0 ? (
                  <span className="text-xs text-slate-600 italic text-center">No structural outlays recorded yet</span>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={4} dataKey="value">
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px', fontSize: '11px', color: '#cbd5e1' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              
              <div className="flex flex-wrap gap-x-2 gap-y-1 justify-center max-h-12 overflow-y-auto pt-1 border-t border-slate-800/40">
                {pieChartData.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-1 text-[9px] font-semibold font-mono tracking-tight text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: chartColors[idx % chartColors.length] }}></span>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TABLE MATRIX LEDGER LOG WITH INTEGRATED INTERACTIVE CALENDAR */}
          <section className="bg-slate-900 rounded-2xl border border-slate-800/60 p-5 shadow-xl h-fit">
            <div className="mb-5 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">June 2026 Transaction Matrix Calendar</span>
                {selectedDay && <button onClick={() => setSelectedDay(null)} className="text-[11px] text-indigo-400 font-medium hover:underline">Clear Filter</button>}
              </div>
              
              <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5 text-center">
                {Array.from({ length: 30 }, (_, i) => {
                  const dayNumber = i + 1;
                  const dayString = `2026-06-${dayNumber.toString().padStart(2, '0')}`;
                  const dayTransactions = localLedger.filter(item => item.date === dayString);
                  const dayIncome = dayTransactions.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0);
                  const dayExpenses = dayTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0);
                  const netDayBalance = dayIncome - dayExpenses;
                  
                  let dayHighlightClass = "border-slate-900 text-slate-500 bg-slate-950/40 hover:border-slate-800";
                  if (dayTransactions.length > 0) {
                    if (netDayBalance > 0) dayHighlightClass = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold shadow-sm shadow-emerald-500/5";
                    else if (netDayBalance < 0 && Math.abs(netDayBalance) > 500) dayHighlightClass = "bg-rose-500/10 border-rose-500/30 text-rose-400 font-bold shadow-sm shadow-rose-500/5";
                    else dayHighlightClass = "bg-amber-500/10 border-amber-500/20 text-amber-400 font-bold";
                  }
                  if (selectedDay === dayNumber) dayHighlightClass = "bg-indigo-500 border-indigo-400 text-slate-950 font-black ring-2 ring-indigo-500/30 scale-105 transition-all";

                  return (
                    <button key={dayNumber} type="button" onClick={() => setSelectedDay(selectedDay === dayNumber ? null : dayNumber)} className={`py-1.5 text-xs font-mono rounded-lg border transition-all duration-150 cursor-pointer ${dayHighlightClass}`}>
                      {dayNumber}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-sm font-semibold tracking-tight text-slate-200">
                {selectedDay || selectedCategoryFilter 
                  ? `Filtered Stream Log [${selectedDay ? `Day: ${selectedDay}` : ''} ${selectedCategoryFilter ? `Category: ${selectedCategoryFilter.toUpperCase()}` : ''}]` 
                  : 'Recent Transaction Log Ledger'
                }
              </h2>
              {(selectedDay || selectedCategoryFilter) && (
                <button onClick={() => { setSelectedDay(null); setSelectedCategoryFilter(null); }} className="text-xs text-indigo-400 hover:underline">Reset Filters</button>
              )}
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="p-3">Description</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3 text-center">Action</th> 
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-xs font-medium">
                  {localLedger
                    .filter((row) => {
                      if (selectedDay && row.date !== `2026-06-${selectedDay.toString().padStart(2, '0')}`) return false;
                      if (selectedCategoryFilter && row.category !== selectedCategoryFilter) return false;
                      return true;
                    })
                    .map((row) => (
                      <tr key={row.id} className="hover:bg-slate-900/30 transition-all group">
                        <td className="p-3 flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg border ${row.type === 'income' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                            {row.type === 'income' ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                          </div>
                          
                          {/* DYNAMIC HIGH-CONTRAST INVERTED CATEGORY LABELS */}
                          <div className="flex flex-col truncate">
                            <span className="text-slate-100 text-sm font-bold capitalize tracking-wide">
                              {row.category}
                            </span>
                            <span className="text-[11px] font-medium text-slate-500 font-sans truncate max-w-[180px] mt-0.5">
                              {row.description && row.description !== 'Miscellaneous Entry' 
                                ? row.description 
                                : 'No optional note provided'}
                            </span>
                          </div>
                        </td>
                        
                        <td className="p-3 text-slate-400 font-mono">{row.date}</td>
                        <td className={`p-3 text-right font-mono font-bold ${row.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>{row.type === 'income' ? '+' : '-'}₹{parseFloat(row.amount).toFixed(2)}</td>
                        
                        <td className="p-3 text-center">
                          <button onClick={() => handleDeleteTransaction(row.id)} className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
                        </td>
                      </tr>
                    ))}

                  {localLedger.filter((row) => {
                    if (selectedDay && row.date !== `2026-06-${selectedDay.toString().padStart(2, '0')}`) return false;
                    if (selectedCategoryFilter && row.category !== selectedCategoryFilter) return false;
                    return true;
                  }).length === 0 && (
                    <tr><td colSpan={4} className="p-6 text-center text-slate-500 italic">No records match this custom filter arrangement.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* AI COACH CONTAINER WIDGET */}
        <section className="md:col-span-3 bg-gradient-to-br from-slate-900 to-indigo-950/40 rounded-2xl border border-indigo-500/20 p-6 shadow-xl mt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-4 mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-400">
              <Sparkles className="h-5 w-5" /> SmartSpend Automated AI Budget Coach
            </h2>
            <button 
              onClick={handleTriggerAiConsultation} 
              disabled={aiLoading}
              className={`px-5 py-2.5 font-semibold rounded-xl text-xs border ${
                aiLoading 
                  ? 'bg-slate-800 text-slate-500' 
                  : 'bg-indigo-500/10 hover:bg-indigo-500 text-indigo-300 hover:text-slate-950 border-indigo-500/30 font-bold active:scale-95'
              }`}
            >
              {aiLoading ? 'Engineering Prompt Streams...' : 'Consult SmartSpend AI'}
            </button>
          </div>
          
          <div className="bg-slate-950/80 rounded-xl border border-slate-900 p-5 font-sans min-h-[100px] flex items-center justify-center">
            {aiLoading ? (
              <div className="flex flex-col items-center gap-2 text-sm text-slate-400 animate-pulse">
                <div className="h-2 w-24 bg-indigo-500/40 rounded-full mb-1"></div>
                <span>Gemini is running mathematical passes over ledger distributions...</span>
              </div>
            ) : aiAnalysis ? (
              <div className="w-full text-sm leading-relaxed text-slate-300 prose prose-invert font-normal max-w-none whitespace-pre-wrap">
                {aiAnalysis}
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic font-medium tracking-wide">
                Console idle. Click the button above to authorize the AI pipeline transaction pass.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}