
import React from 'react';
import { NAVIGATION } from '../constants';
import { User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="flex h-screen bg-[#121212] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
              E
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
              EstateFlow AI
            </h1>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {NAVIGATION.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-blue-600/10 text-blue-500 font-medium'
                  : 'text-gray-400 hover:bg-[#252525] hover:text-gray-200'
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#252525] border border-[#333] flex items-center justify-center text-gray-600">
              <User size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 italic">No Active User</p>
              <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest">Awaiting Login</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-[#2a2a2a] bg-[#1a1a1a]/50 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <h2 className="text-lg font-semibold capitalize text-gray-200 tracking-tight">{activeTab}</h2>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded-full bg-gray-500/5 border border-[#2a2a2a] text-gray-600 text-[10px] uppercase font-bold tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-700" />
              Bot: Standby
            </div>
            <div className="px-3 py-1 rounded-full bg-gray-500/5 border border-[#2a2a2a] text-gray-600 text-[10px] uppercase font-bold tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-700" />
              Sync: Standby
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </section>
      </main>
    </div>
  );
};

export default Layout;
