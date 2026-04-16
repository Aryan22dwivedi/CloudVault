import React, { useState } from 'react';
import { LayoutDashboard, FolderOpen, Settings, Cloud, LogOut, Menu, X, ChevronDown, Sun, Moon } from 'lucide-react';

const Layout = ({ children, activeTab, setActiveTab, onLogout, user, isDarkMode, toggleTheme }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const menuItems = [
    { id: 'files', icon: FolderOpen, label: 'My Files' },
    { id: 'analytics', icon: LayoutDashboard, label: 'Cost Monitor' },
    { id: 'tools', icon: Settings, label: 'OCR Tools' },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      
      {/* === MOBILE HEADER === */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-brand-600 dark:bg-slate-950 text-white p-4 flex justify-between items-center z-40 shadow-md">
         <div className="flex items-center gap-2 font-bold text-lg">
            <Cloud className="text-white"/> CloudVault
         </div>
         <div className="flex items-center gap-4">
             {/* Mobile Theme Toggle */}
             <button onClick={toggleTheme} className="p-1 text-white/80 hover:text-white">
                {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
             </button>
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1">
               {isMobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
             </button>
         </div>
      </div>

      {/* === SIDEBAR === */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-brand-600 dark:bg-slate-950 text-white p-6 flex flex-col transition-transform duration-300 shadow-2xl md:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 
      `}>
        <div className="flex items-center gap-2 mb-10 mt-10 md:mt-0">
          <Cloud className="h-8 w-8 text-white" />
          <h1 className="text-2xl font-bold tracking-tight">CloudVault</h1>
        </div>
        
        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all ${
                activeTab === item.id ? 'bg-white/20 font-semibold shadow-inner' : 'hover:bg-white/10 opacity-80'
              }`}
            >
              <item.icon size={20} />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Mobile Sidebar Footer */}
        <div className="mt-auto border-t border-white/20 pt-6 md:hidden">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                    {user?.name?.[0] || 'U'}
                </div>
                <div className="overflow-hidden">
                    <p className="font-bold truncate text-sm">{user?.name || "User"}</p>
                    <p className="text-xs text-white/70 truncate">{user?.email}</p>
                </div>
            </div>
            <button onClick={onLogout} className="flex items-center gap-2 w-full p-2 bg-red-500/20 text-red-100 hover:bg-red-500 hover:text-white rounded-lg transition text-sm">
                <LogOut size={16}/> Logout
            </button>
        </div>
      </aside>

      {/* === MAIN CONTENT === */}
      <main className="flex-1 overflow-auto w-full pt-16 md:pt-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            
            {/* DESKTOP HEADER */}
            <header className="hidden md:flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white capitalize">
                  {activeTab === 'analytics' ? 'Cost Monitor' : activeTab.replace('-', ' ')}
              </h2>
              
              <div className="flex items-center gap-4">
                {/* === THEME TOGGLE BUTTON (DESKTOP) === */}
                <button 
                  onClick={toggleTheme} 
                  className="p-3 rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-700 transition"
                  title="Toggle Dark Mode"
                >
                  {isDarkMode ? <Sun size={20} className="text-amber-400"/> : <Moon size={20} className="text-brand-600"/>}
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button 
                    className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 pr-4 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    >
                        <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-slate-600 overflow-hidden border-2 border-white dark:border-slate-500">
                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`} alt="Avatar" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">{user?.name || "User"}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">{user?.email}</p>
                        </div>
                        <ChevronDown size={16} className="text-slate-400"/>
                    </button>

                    {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-600 z-50 animate-fade-in overflow-hidden">
                        <button 
                        onClick={onLogout}
                        className="flex items-center gap-2 w-full px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition text-sm font-medium"
                        >
                        <LogOut size={16}/> Logout
                        </button>
                    </div>
                    )}
                </div>
              </div>
            </header>

            {/* Page Content */}
            <div className="animate-fade-in pb-20 md:pb-0">
                {children}
            </div>
        </div>
      </main>

      {/* Mobile Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;