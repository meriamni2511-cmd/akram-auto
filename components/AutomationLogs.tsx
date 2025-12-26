
import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Filter, X, Search } from 'lucide-react';
import { AutomationLog } from '../types';

// Real system event bridge
export const logEmitter = {
  listeners: [] as Array<(log: AutomationLog) => void>,
  subscribe(callback: (log: AutomationLog) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  },
  emit(module: AutomationLog['module'], message: string, level: AutomationLog['level']) {
    const log: AutomationLog = {
      id: Math.random().toString(36),
      timestamp: new Date().toLocaleTimeString(),
      module,
      message,
      level
    };
    this.listeners.forEach(l => l(log));
  }
};

const AutomationLogs: React.FC = () => {
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const modules = ['ALL', 'INGESTOR', 'AI_AGENT', 'AIRTOP', 'SYSTEM', 'NETWORK'];
  const levels = ['ALL', 'info', 'success', 'warning', 'error'];

  useEffect(() => {
    const unsubscribe = logEmitter.subscribe((newLog) => {
      setLogs(prev => [...prev.slice(-99), newLog]);
    });
    
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, moduleFilter, levelFilter, searchTerm]);

  const filteredLogs = logs.filter(log => {
    const matchesModule = moduleFilter === 'ALL' || log.module === moduleFilter;
    const matchesLevel = levelFilter === 'ALL' || log.level === levelFilter;
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesModule && matchesLevel && matchesSearch;
  });

  return (
    <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] h-[500px] flex flex-col overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between bg-[#1f1f1f]">
        <div className="flex items-center gap-2">
          <Terminal size={18} className="text-blue-500" />
          <h3 className="font-semibold text-sm">Real-time Automation Logs</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">System Online</span>
        </div>
      </div>

      <div className="p-3 bg-[#161616] border-b border-[#2a2a2a] space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input 
            type="text"
            placeholder="Search activity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#2a2a2a] border border-[#3a3a3a] text-xs text-gray-300 rounded-lg pl-9 pr-4 py-2 outline-none focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <select 
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="bg-[#2a2a2a] border border-[#3a3a3a] text-[10px] text-gray-300 rounded px-2 py-1 outline-none"
          >
            {modules.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select 
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-[#2a2a2a] border border-[#3a3a3a] text-[10px] text-gray-300 rounded px-2 py-1 outline-none"
          >
            {levels.map(l => (
              <option key={l} value={l}>{l.toUpperCase()}</option>
            ))}
          </select>

          {(moduleFilter !== 'ALL' || levelFilter !== 'ALL' || searchTerm !== '') && (
            <button onClick={() => {setModuleFilter('ALL'); setLevelFilter('ALL'); setSearchTerm('');}} className="text-[10px] text-blue-500 font-bold uppercase">Reset</button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[11px] bg-[#0d0d0d]">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <div key={log.id} className="flex gap-3 items-start hover:bg-white/5 p-1 rounded transition-colors">
              <span className="text-gray-600 shrink-0">[{log.timestamp}]</span>
              <span className={`font-bold shrink-0 w-20 text-[10px] ${
                log.module === 'INGESTOR' ? 'text-purple-400' :
                log.module === 'AI_AGENT' ? 'text-blue-400' :
                log.module === 'AIRTOP' ? 'text-yellow-400' :
                log.module === 'SYSTEM' ? 'text-green-400' :
                'text-red-400'
              }`}>
                {log.module}
              </span>
              <span className={log.level === 'error' ? 'text-red-400' : log.level === 'warning' ? 'text-yellow-300' : log.level === 'success' ? 'text-emerald-400' : 'text-gray-400'}>
                {log.message}
              </span>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-gray-800 italic uppercase text-[9px] tracking-widest">
            Waiting for session data...
          </div>
        )}
      </div>
    </div>
  );
};

export default AutomationLogs;
