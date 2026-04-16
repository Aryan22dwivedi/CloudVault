import React from 'react';
import { RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Analytics({ data, chartData, onRefresh, isDarkMode }) {
  return (
    <div className="space-y-6 pb-20 md:pb-0"> {/* Added padding bottom for mobile scrolling */}
      
      {/* GRID LAYOUT FIX:
         - Mobile: grid-cols-1 (Stack vertically)
         - Desktop: grid-cols-2 (Side by side)
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        
        {/* Card 1: Cost */}
        <div className="bg-white dark:bg-slate-700 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-600 transition-colors">
          <p className="text-slate-500 dark:text-slate-300 mb-1 text-sm md:text-base">Current Monthly Cost</p>
          <h3 className="text-3xl md:text-4xl font-bold text-brand-600 dark:text-brand-400">{data.current_cost}</h3>
        </div>

        {/* Card 2: Storage & Refresh */}
        {/* FLEX LAYOUT FIX: Mobile = Column (Text top, Button bottom), Desktop = Row */}
        <div className="bg-white dark:bg-slate-700 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-600 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
          <div>
            <p className="text-slate-500 dark:text-slate-300 mb-1 text-sm md:text-base">Total Storage Used</p>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">{data.total_storage}</h3>
          </div>
          
          {/* Button: Full width on mobile for easier tapping */}
          <button 
            onClick={onRefresh} 
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 md:py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition shadow-lg shadow-brand-500/30 active:scale-95 font-medium"
          >
            <RefreshCw size={18} /> 
            <span>Refresh Analysis</span>
          </button>
        </div>
      </div>
      
      {/* Chart Section */}
      <div className="bg-white dark:bg-slate-700 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-600 transition-colors">
        <h3 className="font-semibold text-lg mb-6 text-slate-800 dark:text-white">Cost History</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#475569" : "#e2e8f0"} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} height={60} tickMargin={10}  />
              <YAxis stroke="#94a3b8" fontSize={12} width={40} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: isDarkMode ? '#1e293b' : '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                itemStyle={{ color: isDarkMode ? '#fff' : '#000' }}
              />
              <Line type="monotone" dataKey="cost" stroke="#0ea5e9" strokeWidth={3} dot={{ fill: '#0ea5e9', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}