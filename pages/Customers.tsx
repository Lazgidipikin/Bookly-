
import React from 'react';
import { Customer } from '../types';

interface CustomersProps {
  customers: Customer[];
  onNav: (tab: string) => void;
}

const Customers: React.FC<CustomersProps> = ({ customers, onNav }) => {
  const exportCRM = () => {
    const csvRows = [
      ["Name", "Phone", "Tier", "Total Spent", "Orders", "Last Order"],
      ...customers.map(c => [
        c.name, 
        c.phone || "N/A", 
        c.tier, 
        c.totalSpent.toString(), 
        c.orderCount.toString(), 
        c.lastOrderDate || "N/A"
      ])
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bookly_crm_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert("CRM Exported to CSV successfully!");
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">CRM Dashboard</h2>
        <button onClick={exportCRM} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-100">
           <i className="fa-solid fa-download"></i> Export CRM
        </button>
      </div>

      <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm flex items-center justify-between">
         <div className="flex items-center bg-slate-100 px-3 py-2 rounded-xl text-slate-500 w-full">
            <i className="fa-solid fa-magnifying-glass text-xs mr-3"></i>
            <input type="text" placeholder="Search customer database..." className="bg-transparent outline-none text-xs w-full font-medium" />
         </div>
      </div>

      <div className="space-y-4">
        {customers.length > 0 ? (
          customers.map(customer => (
            <div key={customer.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex justify-between items-center hover:bg-slate-50 transition-colors cursor-pointer active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center text-slate-600 font-black text-xl shadow-inner">
                  {customer.name.charAt(0)}
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-slate-900">{customer.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                      customer.tier === 'VIP' ? 'bg-amber-100 text-amber-700' : 
                      customer.tier === 'Returning' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {customer.tier}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{customer.orderCount} Orders</span>
                  </div>
                  {customer.phone && <p className="text-[10px] text-slate-500 font-medium">{customer.phone}</p>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-slate-900">{customer.totalSpent.toLocaleString()}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Revenue</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 space-y-4 opacity-40">
            <i className="fa-solid fa-users text-6xl"></i>
            <p className="italic font-black text-xs uppercase tracking-widest">Your customer list is empty</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-3xl text-center space-y-2">
         <p className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">Pro Insight</p>
         <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">Your VIP customers contribute to **65%** of your total revenue. Reach out to them via WhatsApp for repeat offers.</p>
      </div>
    </div>
  );
};

export default Customers;
