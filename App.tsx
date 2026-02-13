
import React, { useState, useEffect } from 'react';
import { AppState, BusinessProfile, Order, Product, Customer, Expense } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Expenses from './pages/Expenses';
import Settings from './pages/Settings';
import { extractOrderFromText } from './geminiService';

const INITIAL_PROFILE: BusinessProfile = {
  name: 'Lagos Urban Styles',
  currency: 'NGN',
  phone: '+234 812 345 6789',
  email: 'sales@lagosurban.com',
  footerNote: 'Thank you for shopping with us!',
  vipThreshold: 5
};

const DUMMY_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Agbada Classic Blue', costPrice: 15000, sellingPrice: 35000, stock: 12, lowStockThreshold: 5 },
  { id: 'p2', name: 'Ankara Heels Red', costPrice: 8000, sellingPrice: 18000, stock: 4, lowStockThreshold: 5 },
  { id: 'p3', name: 'Native Cap (Fila)', costPrice: 2500, sellingPrice: 6500, stock: 2, lowStockThreshold: 5 },
];

const DUMMY_EXPENSES: Expense[] = [
  { id: 'e1', category: 'Transport', amount: 2500, date: new Date().toISOString(), note: 'Delivery to Island' },
  { id: 'e2', category: 'Data', amount: 5000, date: new Date().toISOString(), note: 'Monthly Sub' }
];

const DUMMY_ORDERS: Order[] = [
  {
    id: 'ord_001',
    customerName: 'Chidi Okafor',
    items: [{ id: 'i1', name: 'Agbada Classic Blue', quantity: 1, price: 35000 }],
    total: 35000,
    date: new Date().toISOString(),
    status: 'Paid',
    source: 'WhatsApp',
    paymentMethod: 'Transfer',
  }
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('bookly_mvp_state_v3');
    const initialState = saved ? JSON.parse(saved) : {
      isLoggedIn: false,
      profile: INITIAL_PROFILE,
      orders: DUMMY_ORDERS,
      products: DUMMY_PRODUCTS,
      customers: [],
      expenses: DUMMY_EXPENSES,
      settings: { showFab: true, soundEnabled: false }
    };
    // Ensure settings exist for legacy state
    if (!initialState.settings) initialState.settings = { showFab: true, soundEnabled: false };
    return { ...initialState, isOnline: navigator.onLine };
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showFabMenu, setShowFabMenu] = useState(false);

  // Modals
  const [showManualSale, setShowManualSale] = useState(false);
  const [showAICapture, setShowAICapture] = useState(false);

  // Manual Sale Form State
  const [manualSaleForm, setManualSaleForm] = useState({
    customerName: 'Guest',
    amount: '',
    note: '',
    source: 'Walk-in'
  });

  // AI Capture State
  const [aiInputText, setAiInputText] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  useEffect(() => {
    const { isOnline, ...rest } = state;
    localStorage.setItem('bookly_mvp_state_v3', JSON.stringify(rest));
  }, [state]);

  const addExpense = (expense: Expense) => {
    setState(prev => ({
      ...prev,
      expenses: [expense, ...prev.expenses]
    }));
  };

  const handleManualSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(manualSaleForm.amount);
    if (amount > 0) {
      const newOrder: Order = {
        id: Date.now().toString(),
        customerName: manualSaleForm.customerName,
        items: [], // Simplified for manual amount entry
        total: amount,
        date: new Date().toISOString(),
        status: 'Paid',
        source: manualSaleForm.source as any,
        paymentMethod: 'Cash',
        note: manualSaleForm.note
      };
      setState(prev => ({ ...prev, orders: [newOrder, ...prev.orders] }));
      setShowManualSale(false);
      setManualSaleForm({ customerName: 'Guest', amount: '', note: '', source: 'Walk-in' });
      alert('Sale Recorded Successfully!');
    }
  };

  const handleAICapture = async () => {
    if (!aiInputText) return;
    setIsProcessingAI(true);
    try {
      // Attempt to use the real service if API key is present (env check logic usually in service)
      // For MVP demo, simulating intelligent extraction if key fails or is missing
      const result = await extractOrderFromText(aiInputText).catch(() => null);

      if (result && result.totalAmount) {
        setManualSaleForm({
          customerName: result.customerName || 'Unknown',
          amount: result.totalAmount.toString(),
          note: `Extracted: ${result.items?.map((i: any) => i.name).join(', ')}`,
          source: result.source || 'Other'
        });
        setShowAICapture(false);
        setShowManualSale(true);
      } else {
        // Fallback demo logic if API fails
        const mockAmount = aiInputText.match(/\d+/);
        setManualSaleForm({
          customerName: 'Extracted Customer',
          amount: mockAmount ? mockAmount[0] : '',
          note: aiInputText.substring(0, 50) + '...',
          source: 'WhatsApp'
        });
        setShowAICapture(false);
        setShowManualSale(true);
      }
    } catch (e) {
      alert('AI Processing failed. Please enter manually.');
    } finally {
      setIsProcessingAI(false);
      setAiInputText('');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard state={state} onNav={setActiveTab} />;
      case 'inventory': return <Inventory state={state} onUpdateProducts={(p) => setState(prev => ({ ...prev, products: p }))} />;
      case 'expenses': return <Expenses state={state} onAddExpense={addExpense} />;
      case 'settings': return <Settings profile={state.profile} settings={state.settings} onUpdateProfile={(p) => setState(prev => ({ ...prev, profile: p }))} onUpdateSettings={(s) => setState(prev => ({ ...prev, settings: s }))} onLogout={() => setState(prev => ({ ...prev, isLoggedIn: false }))} />;
      default: return <Dashboard state={state} onNav={setActiveTab} />;
    }
  };

  if (!state.isLoggedIn) return <Login onLogin={() => setState(p => ({ ...p, isLoggedIn: true }))} />;

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 relative shadow-2xl overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-white px-6 py-4 flex justify-between items-center z-40 sticky top-0 border-b border-slate-100/80 backdrop-blur-md bg-white/90">
        <div>
          <h1 className="text-lg font-extrabold tracking-tighter text-slate-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-sm shadow-md shadow-slate-200">
              <i className="fa-solid fa-b"></i>
            </span>
            <span className="truncate max-w-[150px]">{state.profile.name || 'Bookly'}</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveTab('settings')} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fa-solid fa-gear text-lg"></i>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 pt-4 px-4 scroll-smooth no-scrollbar">
        {renderContent()}
      </main>

      {/* Floating Action Button */}
      {state.settings.showFab && (
        <>
          {showFabMenu && (
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-all" onClick={() => setShowFabMenu(false)}></div>
          )}

          <div className="absolute bottom-24 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
            <div className={`flex flex-col items-end gap-3 transition-all duration-300 ${showFabMenu ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
              <button onClick={() => { setShowFabMenu(false); setShowAICapture(true); }} className="bg-white text-slate-800 px-5 py-3 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-3 hover:bg-slate-50 transition-colors">
                AI Capture <i className="fa-solid fa-wand-magic-sparkles text-purple-600 text-lg"></i>
              </button>
              <button onClick={() => { setShowFabMenu(false); setShowManualSale(true); }} className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-3 hover:bg-slate-800 transition-colors">
                Manual Sale <i className="fa-solid fa-plus text-emerald-400 text-lg"></i>
              </button>
            </div>

            <button
              onClick={() => setShowFabMenu(!showFabMenu)}
              className={`w-14 h-14 rounded-2xl shadow-2xl shadow-indigo-500/30 flex items-center justify-center text-2xl transition-all duration-300 pointer-events-auto ${showFabMenu ? 'bg-slate-900 text-white rotate-45 scale-90' : 'bg-indigo-600 text-white hover:scale-110'}`}
            >
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>
        </>
      )}

      {/* Manual Sale Modal */}
      {showManualSale && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-[400px] rounded-t-[32px] sm:rounded-[32px] p-6 animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Record Sale</h3>
              <button onClick={() => setShowManualSale(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleManualSaleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</label>
                <input type="number" required value={manualSaleForm.amount} onChange={e => setManualSaleForm({ ...manualSaleForm, amount: e.target.value })} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-2xl font-black text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="0.00" autoFocus />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer Name</label>
                <input type="text" value={manualSaleForm.customerName} onChange={e => setManualSaleForm({ ...manualSaleForm, customerName: e.target.value })} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none" placeholder="Guest" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Source</label>
                <select value={manualSaleForm.source} onChange={e => setManualSaleForm({ ...manualSaleForm, source: e.target.value })} className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none">
                  <option value="Walk-in">Walk-in</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-emerald-500 text-white py-4 rounded-xl font-black text-sm shadow-xl shadow-emerald-200 mt-4">Confirm Sale</button>
            </form>
          </div>
        </div>
      )}

      {/* AI Capture Modal */}
      {showAICapture && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-[400px] rounded-t-[32px] sm:rounded-[32px] p-6 animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2"><i className="fa-solid fa-wand-magic-sparkles text-purple-600"></i> AI Capture</h3>
              <button onClick={() => setShowAICapture(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-medium">Unknown image/text source? Paste the order details below and let AI handle the rest.</p>
              <textarea
                value={aiInputText}
                onChange={e => setAiInputText(e.target.value)}
                className="w-full h-32 bg-slate-50 border-none rounded-xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="e.g. 'I want 2 pairs of Ankara Heels and 1 Agbada. Delivery to Lekki.'"
              ></textarea>
              <button
                onClick={handleAICapture}
                disabled={isProcessingAI || !aiInputText}
                className="w-full bg-purple-600 text-white py-4 rounded-xl font-black text-sm shadow-xl shadow-purple-200 mt-4 flex justify-center items-center gap-2"
              >
                {isProcessingAI ? <i className="fa-solid fa-circle-notch animate-spin"></i> : 'Process Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around py-4 pb-6 px-2 z-40 max-w-md mx-auto">
        <NavButton active={activeTab === 'dashboard'} icon="fa-chart-pie" label="Insights" onClick={() => setActiveTab('dashboard')} />
        <NavButton active={activeTab === 'inventory'} icon="fa-layer-group" label="Stock" onClick={() => setActiveTab('inventory')} />
        <NavButton active={activeTab === 'expenses'} icon="fa-wallet" label="Expenses" onClick={() => setActiveTab('expenses')} />
      </nav>
    </div>
  );
};

const NavButton = ({ active, icon, label, onClick }: { active: boolean, icon: string, label: string, onClick: () => void }) => (
  <button onClick={onClick} className={`relative flex flex-col items-center gap-1.5 transition-all duration-300 w-16 p-2 rounded-2xl ${active ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}>
    <i className={`fa-solid ${icon} ${active ? 'text-lg' : 'text-lg'}`}></i>
    <span className={`text-[9px] font-black uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
  </button>
);

export default App;
