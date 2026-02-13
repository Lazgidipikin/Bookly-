
import React, { useState } from 'react';
import { AppState, Expense } from '../types';

interface ExpensesProps {
    state: AppState;
    onAddExpense: (expense: Expense) => void;
}

const CATEGORIES = ['Rent', 'Utilities', 'Inventory', 'Data', 'Transport', 'Marketing', 'Salaries', 'Other'];

const Expenses: React.FC<ExpensesProps> = ({ state, onAddExpense }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newExpense, setNewExpense] = useState<Partial<Expense>>({
        category: 'Other',
        amount: 0,
        note: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newExpense.amount! > 0) {
            onAddExpense({
                id: Date.now().toString(),
                category: newExpense.category || 'Other',
                amount: newExpense.amount || 0,
                date: new Date().toISOString(),
                note: newExpense.note
            });
            setIsAdding(false);
            setNewExpense({ category: 'Other', amount: 0, note: '' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Expenses</h2>
                    <p className="text-slate-500 text-xs font-medium">Track your spending</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-slate-800 transition-colors"
                >
                    <i className="fa-solid fa-plus mr-2"></i>
                    Add New
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-6 rounded-[28px] shadow-xl border border-indigo-100 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">New Expense Log</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount</label>
                                <input
                                    type="number" required
                                    value={newExpense.amount || ''}
                                    onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
                                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                                <select
                                    value={newExpense.category}
                                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Note (Optional)</label>
                            <input
                                type="text"
                                value={newExpense.note}
                                onChange={(e) => setNewExpense({ ...newExpense, note: e.target.value })}
                                className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                                placeholder="Description..."
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold">Cancel</button>
                            <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-200">Save Expense</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-3">
                {state.expenses.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300 mb-3">
                            <i className="fa-solid fa-receipt text-2xl"></i>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">No expenses logged yet</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
                        {state.expenses.slice().reverse().map((expense, i) => (
                            <div key={expense.id} className={`p-4 flex justify-between items-center hover:bg-slate-50 transition-colors ${i !== state.expenses.length - 1 ? 'border-b border-slate-50' : ''}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100 font-bold text-xs uppercase">
                                        {expense.category.substring(0, 2)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{expense.category}</p>
                                        <p className="text-[10px] text-slate-400">{expense.note || 'No description'} • {new Date(expense.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-slate-900">-{state.profile.currency}{expense.amount.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Expenses;
