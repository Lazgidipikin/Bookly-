
import React, { useState, useEffect } from 'react';
import { AppState, BusinessProfile, Order, Product, Customer, Expense } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Expenses from './pages/Expenses';
import Settings from './pages/Settings';
import { extractOrderFromText } from './geminiService';

const INITIAL_PROFILE: BusinessProfile = {
  name: 'My Business',
  currency: 'NGN',
  phone: '',
  email: '',
  footerNote: 'Thank you for your patronage!',
  vipThreshold: 5
};

const NAV_ITEMS = [
  { id: 'dashboard', icon: 'fa-chart-pie', label: 'Home' },
  { id: 'orders', icon: 'fa-receipt', label: 'Orders' },
  { id: 'inventory', icon: 'fa-layer-group', label: 'Stock' },
  { id: 'customers', icon: 'fa-users', label: 'CRM' },
  { id: 'expenses', icon: 'fa-wallet', label: 'Costs' },
  { id: 'settings', icon: 'fa-gear', label: 'Settings' },
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('bookly_mvp_state_v4');
    const initialState = saved ? JSON.parse(saved) : {
      isLoggedIn: false,
      profile: INITIAL_PROFILE,
      orders: [],
      products: [],
      customers: [],
      expenses: [],
      settings: { showFab: true, soundEnabled: false }
    };
    if (!initialState.settings) initialState.settings = { showFab: true, soundEnabled: false };
    return { ...initialState, isOnline: navigator.onLine };
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Modals
  const [showManualSale, setShowManualSale] = useState(false);
  const [showAICapture, setShowAICapture] = useState(false);

  // Manual Sale Form State
  const [manualSaleForm, setManualSaleForm] = useState<{
    customerName: string;
    items: { id: string; name: string; quantity: number; price: number }[];
    note: string;
    source: string;
  }>({
    customerName: 'Guest',
    items: [{ id: '1', name: 'Item 1', quantity: 1, price: 0 }],
    note: '',
    source: 'Walk-in'
  });

  // AI Capture State
  const [aiInputText, setAiInputText] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  // Receipt Modal State
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  useEffect(() => {
    const { isOnline, ...rest } = state;
    localStorage.setItem('bookly_mvp_state_v4', JSON.stringify(rest));
  }, [state]);

  const addExpense = (expense: Expense) => {
    setState(prev => ({
      ...prev,
      expenses: [expense, ...prev.expenses]
    }));
  };

  const handleManualSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = manualSaleForm.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (totalAmount > 0) {
      const newOrder: Order = {
        id: Date.now().toString(),
        customerName: manualSaleForm.customerName,
        items: manualSaleForm.items.map(i => ({ ...i, variant: 'Standard', id: i.id || Date.now().toString() })),
        total: totalAmount,
        date: new Date().toISOString(),
        status: 'Paid',
        source: manualSaleForm.source as any,
        paymentMethod: 'Cash',
        note: manualSaleForm.note
      };
      setState(prev => ({ ...prev, orders: [newOrder, ...prev.orders] }));
      setShowManualSale(false);
      setManualSaleForm({ customerName: 'Guest', items: [{ id: Date.now().toString(), name: 'Item 1', quantity: 1, price: 0 }], note: '', source: 'Walk-in' });
      setReceiptOrder(newOrder);
    }
  };

  const addItemToSale = () => {
    setManualSaleForm(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now().toString(), name: '', quantity: 1, price: 0 }]
    }));
  };

  const updateSaleItem = (id: string, field: string, value: any) => {
    setManualSaleForm(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const removeSaleItem = (id: string) => {
    if (manualSaleForm.items.length === 1) return;
    setManualSaleForm(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handleAICapture = async () => {
    if (!aiInputText) return;
    setIsProcessingAI(true);
    try {
      const result = await extractOrderFromText(aiInputText, state.products);

      if (result && result.items.length > 0) {
        setManualSaleForm({
          customerName: result.customerName || 'Walk-in Customer',
          items: result.items,
          note: `AI captured from text`,
          source: result.source || 'Other'
        });
        setShowAICapture(false);
        setShowManualSale(true);
      } else {
        const productNames = state.products.map(p => p.name).join(', ');
        alert(
          state.products.length === 0
            ? 'No products in inventory yet. Add products first, then AI can match them from text.'
            : `Could not match any products from the text.\n\nYour inventory: ${productNames}\n\nTry pasting text that mentions one of these products.`
        );
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
      case 'orders': return <Orders state={state} onUpdateOrders={(orders) => setState(prev => ({ ...prev, orders }))} />;
      case 'inventory': return <Inventory state={state} onUpdateProducts={(p) => setState(prev => ({ ...prev, products: p }))} />;
      case 'customers': return <Customers state={state} onAddCustomer={(c) => setState(prev => ({ ...prev, customers: [c, ...prev.customers] }))} />;
      case 'expenses': return <Expenses state={state} onAddExpense={addExpense} />;
      case 'settings': return <Settings profile={state.profile} settings={state.settings} onUpdateProfile={(p) => setState(prev => ({ ...prev, profile: p }))} onUpdateSettings={(s) => setState(prev => ({ ...prev, settings: s }))} onLogout={() => setState(prev => ({ ...prev, isLoggedIn: false }))} />;
      default: return <Dashboard state={state} onNav={setActiveTab} />;
    }
  };

  if (!state.isLoggedIn) return <Login onLogin={() => setState(p => ({ ...p, isLoggedIn: true }))} />;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif' }}>

      {/* ── SIDEBAR NAV (tablet + desktop only) ── */}
      <aside className={`hidden md:flex flex-col bg-white border-r border-slate-100 z-40 transition-all duration-300 shrink-0 ${sidebarCollapsed ? 'w-[72px]' : 'w-[220px]'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-50">
          <span className="w-9 h-9 bg-teal-500 text-white rounded-xl flex items-center justify-center text-base font-black shadow-md shadow-teal-200 shrink-0">
            <span>B.</span>
          </span>
          {!sidebarCollapsed && (
            <span className="font-extrabold tracking-tight text-slate-900 truncate text-sm">{state.profile.name || 'Bookly'}</span>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${activeTab === item.id
                ? 'bg-teal-500 text-white shadow-md shadow-teal-200'
                : 'text-slate-500 hover:bg-slate-50 hover:text-teal-600'
                }`}
            >
              <i className={`fa-solid ${item.icon} text-base shrink-0 ${activeTab === item.id ? '' : 'group-hover:scale-110 transition-transform'}`}></i>
              {!sidebarCollapsed && (
                <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t border-slate-50 p-3">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-slate-50 transition-all"
          >
            <i className={`fa-solid fa-chevron-${sidebarCollapsed ? 'right' : 'left'} text-xs`}></i>
            {!sidebarCollapsed && <span className="text-[10px] font-bold uppercase tracking-widest">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Header (mobile: sticky top bar; desktop: top bar inside main) */}
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-100/80 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center z-30 sticky top-0">
          <div className="flex items-center gap-3">
            {/* Mobile logo */}
            <div className="flex md:hidden items-center gap-2">
              <span className="w-8 h-8 bg-teal-500 text-white rounded-xl flex items-center justify-center text-sm font-black shadow-md shadow-teal-200 shrink-0">
                <span>B.</span>
              </span>
              <span className="font-extrabold tracking-tight text-slate-900 text-base truncate max-w-[130px]">{state.profile.name || 'Bookly'}</span>
            </div>
            {/* Desktop breadcrumb */}
            <div className="hidden md:block">
              <h2 className="text-lg font-black text-slate-900 capitalize tracking-tight">
                {NAV_ITEMS.find(n => n.id === activeTab)?.label || 'Dashboard'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Quick add button on desktop */}
            <button
              onClick={() => setShowManualSale(true)}
              className="hidden md:flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-md shadow-teal-200 hover:bg-teal-600 transition-all"
            >
              <i className="fa-solid fa-plus"></i> Record Sale
            </button>
            <button
              onClick={() => setShowAICapture(true)}
              className="hidden md:flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              <i className="fa-solid fa-wand-magic-sparkles text-purple-600"></i> AI Capture
            </button>
            {/* Mobile settings shortcut */}
            <button onClick={() => setActiveTab('settings')} className="flex md:hidden text-slate-400 hover:text-teal-500 transition-colors">
              <i className="fa-solid fa-gear text-lg"></i>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8 pt-4 px-4 md:px-6 lg:px-8 scroll-smooth no-scrollbar">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* ── FLOATING ACTION BUTTON (mobile only) ── */}
      {activeTab === 'dashboard' && state.settings.showFab && (
        <>
          {showFabMenu && (
            <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setShowFabMenu(false)}></div>
          )}

          <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none md:hidden">
            <div className={`flex flex-col items-end gap-3 transition-all duration-300 ${showFabMenu ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
              <button onClick={() => { setShowFabMenu(false); setShowAICapture(true); }} className="bg-white text-slate-800 px-5 py-3 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-3 hover:bg-slate-50 transition-colors">
                AI Capture <i className="fa-solid fa-wand-magic-sparkles text-teal-600 text-lg"></i>
              </button>
              <button onClick={() => { setShowFabMenu(false); setShowManualSale(true); }} className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-3 hover:bg-slate-800 transition-colors">
                Manual Sale <i className="fa-solid fa-plus text-teal-400 text-lg"></i>
              </button>
            </div>

            <button
              onClick={() => setShowFabMenu(!showFabMenu)}
              className={`w-14 h-14 rounded-2xl shadow-2xl shadow-teal-500/30 flex items-center justify-center text-2xl transition-all duration-300 pointer-events-auto ${showFabMenu ? 'bg-slate-900 text-white rotate-45 scale-90' : 'bg-teal-500 text-white hover:scale-110'}`}
            >
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>
        </>
      )}

      {/* Manual Sale Modal */}
      {showManualSale && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-[420px] rounded-t-[32px] sm:rounded-[32px] p-6 animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Record Sale</h3>
              <button onClick={() => setShowManualSale(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleManualSaleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Items</label>
                  <button type="button" onClick={addItemToSale} className="text-[10px] font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-2 py-1 rounded-lg">+ Add Item</button>
                </div>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {manualSaleForm.items.map((item, index) => (
                    <div key={item.id} className="flex gap-2 items-start">
                      <div className="flex-1 space-y-1">
                        {state.products.length > 0 ? (
                          <div className="relative">
                            <select
                              value={state.products.find(p => p.name === item.name) ? item.name : 'custom'}
                              onChange={(e) => {
                                const selected = state.products.find(p => p.name === e.target.value);
                                if (selected) {
                                  updateSaleItem(item.id, 'name', selected.name);
                                  updateSaleItem(item.id, 'price', selected.sellingPrice);
                                } else {
                                  if (e.target.value === 'custom') updateSaleItem(item.id, 'name', '');
                                }
                              }}
                              className="w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-teal-500 appearance-none"
                            >
                              <option value="custom">Custom / Select Product...</option>
                              {state.products.map(p => (
                                <option key={p.id} value={p.name}>{p.name}</option>
                              ))}
                            </select>
                            {(!state.products.find(p => p.name === item.name)) && (
                              <input
                                type="text"
                                placeholder="Enter Custom Name"
                                value={item.name}
                                onChange={e => updateSaleItem(item.id, 'name', e.target.value)}
                                className="mt-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-teal-500"
                              />
                            )}
                          </div>
                        ) : (
                          <input type="text" required placeholder="Item Name" value={item.name} onChange={e => updateSaleItem(item.id, 'name', e.target.value)} className="w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-teal-500" />
                        )}
                      </div>
                      <div className="w-16 space-y-1">
                        <input type="number" required min="1" placeholder="Qty" value={item.quantity} onChange={e => updateSaleItem(item.id, 'quantity', parseInt(e.target.value) || 1)} className="w-full bg-slate-50 border-none rounded-lg px-2 py-2 text-xs font-bold outline-none text-center" />
                      </div>
                      <div className="w-24 space-y-1">
                        <input type="number" required min="0" placeholder="Price" value={item.price} onChange={e => updateSaleItem(item.id, 'price', parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border-none rounded-lg px-2 py-2 text-xs font-bold outline-none text-right" />
                      </div>
                      {manualSaleForm.items.length > 1 && (
                        <button type="button" onClick={() => removeSaleItem(item.id)} className="pt-2 text-slate-300 hover:text-red-500"><i className="fa-solid fa-trash-can"></i></button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                  <span className="text-xs font-bold text-slate-500">Total</span>
                  <span className="text-xl font-black text-slate-900">
                    {(manualSaleForm.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}
                  </span>
                </div>
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
          <div className="bg-white w-full max-w-[420px] rounded-t-[32px] sm:rounded-[32px] p-6 animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2"><i className="fa-solid fa-wand-magic-sparkles text-purple-600"></i> AI Capture</h3>
              <button onClick={() => setShowAICapture(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-medium">Paste order details below and let AI handle the rest.</p>
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

      {/* Receipt / Invoice Modal */}
      {receiptOrder && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-[380px] rounded-[28px] shadow-2xl animate-in slide-in-from-bottom-10 overflow-hidden">
            <div className="bg-teal-500 px-6 py-5 text-center text-white">
              <div className="w-12 h-12 bg-white/20 rounded-full mx-auto flex items-center justify-center mb-3">
                <i className="fa-solid fa-check text-xl"></i>
              </div>
              <h3 className="text-lg font-black">Sale Recorded!</h3>
              <p className="text-teal-100 text-xs font-medium mt-1">Invoice #{receiptOrder.id.slice(-6)}</p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="flex justify-between items-start text-xs">
                <div>
                  <p className="font-black text-slate-900">{state.profile.name || 'Bookly'}</p>
                  {state.profile.phone && <p className="text-slate-400">{state.profile.phone}</p>}
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-700">{receiptOrder.customerName}</p>
                  <p className="text-slate-400">{new Date(receiptOrder.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-200"></div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items</p>
                {receiptOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">{item.quantity}x {item.name}</span>
                    <span className="text-slate-800 font-bold">{state.profile.currency}{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-slate-200"></div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-black text-slate-900 uppercase">Total</span>
                <span className="text-2xl font-black text-teal-600">{state.profile.currency}{receiptOrder.total.toLocaleString()}</span>
              </div>

              <div className="flex gap-2 text-[10px] font-bold text-slate-400">
                <span className="bg-slate-100 px-2 py-1 rounded-lg">{receiptOrder.source}</span>
                <span className="bg-slate-100 px-2 py-1 rounded-lg">{receiptOrder.paymentMethod}</span>
                <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg">{receiptOrder.status}</span>
              </div>

              {state.profile.footerNote && (
                <p className="text-center text-[10px] text-slate-400 italic pt-2">{state.profile.footerNote}</p>
              )}
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={() => setReceiptOrder(null)}
                className="w-full bg-teal-500 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-teal-200 hover:bg-teal-600 transition-all active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM NAV (mobile only) ── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around py-3 pb-5 px-1 z-40 md:hidden">
        {NAV_ITEMS.filter(n => n.id !== 'settings').map(item => (
          <NavButton
            key={item.id}
            active={activeTab === item.id}
            icon={item.icon}
            label={item.label}
            onClick={() => setActiveTab(item.id)}
          />
        ))}
      </nav>
    </div>
  );
};

const NavButton = ({ active, icon, label, onClick }: { active: boolean, icon: string, label: string, onClick: () => void }) => (
  <button onClick={onClick} className={`relative flex flex-col items-center gap-1.5 transition-all duration-300 w-14 p-2 rounded-2xl ${active ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:text-teal-500'}`}>
    <i className={`fa-solid ${icon} text-lg`}></i>
    <span className={`text-[9px] font-black uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
  </button>
);

export default App;
