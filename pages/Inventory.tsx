
import React, { useState } from 'react';
import { AppState, Product } from '../types';

interface InventoryProps {
  state: AppState;
  onUpdateProducts: (products: Product[]) => void;
}

const Inventory: React.FC<InventoryProps> = ({ state, onUpdateProducts }) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    // Check if new or existing
    const existingIndex = state.products.findIndex(p => p.id === editingProduct.id);
    let newProducts;

    if (existingIndex >= 0) {
      newProducts = state.products.map(p => p.id === editingProduct.id ? editingProduct : p);
    } else {
      newProducts = [editingProduct, ...state.products];
    }

    onUpdateProducts(newProducts);
    setEditingProduct(null);
  };

  const deleteProduct = (id: string) => {
    if (confirm('Delete this product?')) {
      onUpdateProducts(state.products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Inventory</h2>
          <p className="text-slate-500 text-xs font-medium">Manage your stock</p>
        </div>
        <button
          onClick={() => setEditingProduct({ id: Date.now().toString(), name: '', costPrice: 0, sellingPrice: 0, stock: 0, lowStockThreshold: 5 })}
          className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          <i className="fa-solid fa-plus"></i>
        </button>
      </div>

      {/* Stats Summary - Moved to Top */}
      <div className="bg-slate-900 rounded-[32px] p-6 text-white space-y-4 shadow-xl shadow-slate-200">
        <h3 className="font-bold flex items-center gap-2 uppercase text-xs tracking-widest text-indigo-300">
          <i className="fa-solid fa-chart-pie"></i>
          Inventory Value
        </h3>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Total Cost</p>
            <p className="text-xl font-black tracking-tight">{state.profile.currency} {state.products.reduce((s, p) => s + (p.costPrice * p.stock), 0).toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Potential Revenue</p>
            <p className="text-xl font-black tracking-tight text-emerald-400">{state.profile.currency} {state.products.reduce((s, p) => s + (p.sellingPrice * p.stock), 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {state.products.length === 0 ? (
          <div className="text-center py-12 bg-slate-100 rounded-[32px]">
            <p className="text-slate-400 text-sm font-bold">No products yet.</p>
          </div>
        ) : (
          state.products.map(product => (
            <div key={product.id} className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm space-y-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => deleteProduct(product.id)} className="text-slate-300 hover:text-red-500">
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>

              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                    <i className="fa-solid fa-box-open"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{product.name}</h3>
                    <div className="flex gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">
                      <span>Cost: {state.profile.currency}{product.costPrice.toLocaleString()}</span>
                      <span>Price: {state.profile.currency}{product.sellingPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">In Stock</span>
                  <span className={`text-lg font-black ${product.stock <= product.lowStockThreshold ? 'text-red-500' : 'text-slate-900'}`}>
                    {product.stock}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  >
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button
                    onClick={() => {
                      const amt = prompt(`Add stock for ${product.name}:`);
                      if (amt && !isNaN(parseInt(amt))) {
                        const newProducts = state.products.map(p => p.id === product.id ? { ...p, stock: p.stock + parseInt(amt) } : p);
                        onUpdateProducts(newProducts);
                      }
                    }}
                    className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-700 transition-colors"
                  >
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[400px] rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col p-6 space-y-6 animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">
                {state.products.some(p => p.id === editingProduct.id) ? 'Edit Product' : 'New Product'}
              </h3>
              <button type="button" onClick={() => setEditingProduct(null)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
                <input
                  type="text" required
                  value={editingProduct.name}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Ankara Fabric"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cost Price</label>
                  <input
                    type="number" required
                    value={editingProduct.costPrice || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, costPrice: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Selling Price</label>
                  <input
                    type="number" required
                    value={editingProduct.sellingPrice || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, sellingPrice: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock Level</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={e => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Min. Alert</label>
                  <input
                    type="number"
                    value={editingProduct.lowStockThreshold}
                    onChange={e => setEditingProduct({ ...editingProduct, lowStockThreshold: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-sm shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
