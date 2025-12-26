
import React from 'react';
import { NAVIGATION } from '../constants';
import { User, Menu, Bell } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="flex h-screen bg-[#0a0a0a] text-gray-200 overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-[#111111] border-r border-white/5 flex-col shadow-2xl">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20">
              E
            </div>
            <h1 className="text-xl font-black italic tracking-tighter text-white">
              EstateFlow <span className="text-blue-500">AI</span>
            </h1>
          </div>
        </div>

        <nav className="flex-1 px-6 py-4 space-y-2">
          {NAVIGATION.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-gray-500 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <span className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              <span className="font-bold text-sm uppercase tracking-widest">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5">
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-gray-500 shadow-inner">
              <User size={24} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-black text-white truncate">GUEST AGENT</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Enterprise Tier</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Mobile & Desktop Header */}
        <header className="h-20 lg:h-24 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-2xl flex items-center justify-between px-6 lg:px-12 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="lg:hidden w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg">
              E
            </div>
            <h2 className="text-lg lg:text-2xl font-black italic uppercase tracking-tighter text-white">
              {activeTab}
            </h2>
          </div>
          
          <div className="flex items-center gap-3 lg:gap-6">
            <div className="hidden md:flex items-center gap-4">
              <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                System Active
              </div>
            </div>
            <button className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <Bell size={20} />
            </button>
            <button className="lg:hidden w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
              <Menu size={20} />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <section className="flex-1 overflow-y-auto px-4 py-8 lg:px-12 lg:py-12 pb-32 lg:pb-12 custom-scrollbar scroll-smooth">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </section>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-18 bg-[#161616]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] flex items-center justify-around px-4 shadow-2xl shadow-black z-50">
          {NAVIGATION.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-110 -translate-y-2'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {React.cloneElement(item.icon as React.ReactElement, { size: 20 })}
              <span className={`text-[8px] font-black uppercase tracking-tighter mt-1 transition-opacity ${activeTab === item.id ? 'opacity-100' : 'opacity-0'}`}>
                {item.name}
              </span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default Layout;
