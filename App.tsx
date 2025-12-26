
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import AutomationLogs, { logEmitter } from './components/AutomationLogs';
import PropertyCard from './components/PropertyCard';
import TelegramIngestor from './components/TelegramIngestor';
import { NAVIGATION } from './constants';
import { telegramService } from './services/telegramService';
import { analyzePropertyMedia } from './services/geminiService';
import { automationService } from './services/automationService';
import { VaultService } from './services/storageService';
import { 
  TrendingUp, Users, Target, CheckCircle, Activity, Zap, ShieldCheck, Globe, 
  Key, Eye, EyeOff, Save, Facebook, Check, Database, Lock, Loader2, 
  Unlock, ShieldAlert, LogIn, AlertCircle, RefreshCcw, Home, PlusCircle, 
  HelpCircle, ArrowRight, XCircle, LogOut, ChevronRight 
} from 'lucide-react';
import { Property, PropertyStatus, FacebookCredentials, AuthMethod, PropertyData, AuthFailureReason } from './types';

const ERROR_DESCRIPTIONS: Record<AuthFailureReason, { title: string, help: string, icon: React.ReactNode }> = {
  [AuthFailureReason.INVALID_API_KEY]: {
    title: "License Error",
    help: "Airtop API key is invalid or expired. Check subscription.",
    icon: <XCircle className="text-red-500" />
  },
  [AuthFailureReason.WRONG_CREDENTIALS]: {
    title: "Auth Failed",
    help: "Facebook login invalid. Please check email/password.",
    icon: <AlertCircle className="text-red-500" />
  },
  [AuthFailureReason.TWO_FACTOR_REQUIRED]: {
    title: "2FA Block",
    help: "Facebook requires 2FA. Use 'Session Cookies' instead.",
    icon: <Lock className="text-orange-500" />
  },
  [AuthFailureReason.AUTH_CHALLENGE]: {
    title: "Security Check",
    help: "Manual verification required on your device first.",
    icon: <ShieldAlert className="text-orange-500" />
  },
  [AuthFailureReason.ACCOUNT_LOCKED]: {
    title: "Account Locked",
    help: "Meta has locked this account. Unlock manually in browser.",
    icon: <Lock className="text-red-500" />
  },
  [AuthFailureReason.COOKIES_EXPIRED]: {
    title: "Session Expired",
    help: "Cookies no longer valid. Export fresh JSON cookies.",
    icon: <RefreshCcw className="text-orange-500" />
  },
  [AuthFailureReason.TIMEOUT]: {
    title: "Cloud Timeout",
    help: "Verification session timed out. Please retry.",
    icon: <Activity className="text-gray-500" />
  },
  [AuthFailureReason.NETWORK_ERROR]: {
    title: "Network Error",
    help: "Unable to reach automation clusters. Check connection.",
    icon: <Globe className="text-red-500" />
  }
};

const SettingsTab: React.FC<{
  unlockedCreds: FacebookCredentials | null;
  onSave: (creds: FacebookCredentials, masterPass: string) => void;
  onUnlock: (masterPass: string) => Promise<void>;
  onLock: () => void;
}> = ({ unlockedCreds, onSave, onUnlock, onLock }) => {
  const [authMethod, setAuthMethod] = useState<AuthMethod>(unlockedCreds?.authMethod || 'credentials');
  const [email, setEmail] = useState(unlockedCreds?.email || '');
  const [password, setPassword] = useState(unlockedCreds?.password || '');
  const [cookies, setCookies] = useState(unlockedCreds?.cookies || '');
  const [masterPass, setMasterPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [failureReason, setFailureReason] = useState<AuthFailureReason | null>(null);

  const handleSave = () => {
    if (!masterPass) {
      setUnlockError('Master Password required to save vault.');
      return;
    }
    onSave({ email, password, cookies, authMethod, isSet: true }, masterPass);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleLoginAndVerify = async () => {
    setFailureReason(null);
    setUnlockError(null);
    setIsSuccess(false);

    if (authMethod === 'credentials' && (!email || !password)) {
      setUnlockError('Credentials required.');
      return;
    }
    if (authMethod === 'cookies' && !cookies) {
      setUnlockError('Cookies required.');
      return;
    }
    
    setIsVerifying(true);
    logEmitter.emit('SYSTEM', `Verifying ${authMethod.toUpperCase()}...`, 'info');
    
    try {
      const result = await automationService.verifyFacebookAuth({ email, password, cookies, authMethod, isSet: true });
      
      if (result.success) {
        logEmitter.emit('AIRTOP', 'Verification SUCCESS.', 'success');
        setIsSuccess(true);
        if (masterPass) handleSave();
      } else {
        logEmitter.emit('NETWORK', `Failed: ${result.reason}`, 'error');
        setFailureReason(result.reason!);
      }
    } catch (e: any) {
      setUnlockError(`Infrastructure Error: ${e.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUnlockRequest = async () => {
    setUnlockError(null);
    try {
      await onUnlock(masterPass);
    } catch (e: any) {
      setUnlockError('Decryption failed.');
    }
  };

  if (!unlockedCreds && VaultService.hasVault()) {
    return (
      <div className="max-w-md mx-auto py-12 lg:py-20 animate-in fade-in zoom-in duration-500">
        <div className="bg-[#111] p-10 rounded-[3rem] border border-blue-500/30 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-lg">
            <Lock size={40} />
          </div>
          <h3 className="text-2xl font-black text-white italic uppercase">Vault Locked</h3>
          <div className="space-y-4">
            <input 
              type="password" 
              value={masterPass}
              onChange={(e) => setMasterPass(e.target.value)}
              placeholder="Master Password"
              className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white text-center focus:border-blue-500 outline-none"
            />
            {unlockError && <p className="text-[10px] text-red-500 font-bold uppercase">{unlockError}</p>}
            <button 
              onClick={handleUnlockRequest}
              className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl active:scale-95"
            >
              Unlock Secure Vault
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-2xl text-white">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-xl lg:text-2xl font-black text-white uppercase italic tracking-tight">Security Vault</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Encrypted Authentication</p>
          </div>
        </div>
        <button 
          onClick={onLock} 
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 active:scale-95 transition-transform"
        >
          <Lock size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Lock Vault</span>
        </button>
      </div>

      <div className="bg-[#111] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-4 lg:p-8 border-b border-white/5 flex gap-2 lg:gap-4 bg-white/5">
          <button 
            onClick={() => { setAuthMethod('credentials'); setFailureReason(null); setIsSuccess(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
              authMethod === 'credentials' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
              : 'bg-black text-gray-500 hover:text-gray-300'
            }`}
          >
            <LogIn size={16} />
            Login
          </button>
          <button 
            onClick={() => { setAuthMethod('cookies'); setFailureReason(null); setIsSuccess(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
              authMethod === 'cookies' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
              : 'bg-black text-gray-500 hover:text-gray-300'
            }`}
          >
            <Database size={16} />
            Cookies
          </button>
        </div>

        <div className="p-6 lg:p-8 space-y-8">
          {authMethod === 'credentials' ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Email / Username</label>
                <input 
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-blue-500 outline-none transition-all"
                  placeholder="name@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Password</label>
                <div className="relative">
                  <input 
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-blue-500 outline-none transition-all"
                    placeholder="••••••••••••"
                  />
                  <button onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                    {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Session Cookies (JSON)</label>
                <textarea 
                  value={cookies}
                  onChange={(e) => setCookies(e.target.value)}
                  rows={6}
                  className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-mono text-xs focus:border-blue-500 outline-none resize-none"
                  placeholder='[{"name": "c_user", "value": "..."}]'
                />
              </div>
            </div>
          )}

          {failureReason && (
            <div className="p-6 rounded-[2rem] bg-red-500/10 border border-red-500/20 space-y-4 animate-in slide-in-from-top-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/20 rounded-2xl">{ERROR_DESCRIPTIONS[failureReason].icon}</div>
                <div>
                  <h4 className="text-xs font-black uppercase text-red-500">{ERROR_DESCRIPTIONS[failureReason].title}</h4>
                  <p className="text-[11px] text-gray-400 mt-1">{ERROR_DESCRIPTIONS[failureReason].help}</p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-8 border-t border-white/5 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] ml-2">Master Password</label>
              <input 
                type="password"
                value={masterPass}
                onChange={(e) => { setMasterPass(e.target.value); setUnlockError(null); }}
                className="w-full bg-black border border-blue-500/20 rounded-2xl px-6 py-4 text-white focus:border-blue-500 outline-none"
                placeholder="Required for encryption"
              />
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={handleLoginAndVerify}
                disabled={isVerifying}
                className={`w-full py-6 rounded-[2rem] text-white font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 ${
                  isSuccess ? 'bg-emerald-600' : 'bg-blue-600'
                }`}
              >
                {isVerifying ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : isSuccess ? (
                  <CheckCircle size={24} />
                ) : (
                  <Facebook size={24} />
                )}
                {isVerifying ? 'Verifying Cloud Login...' : isSuccess ? 'Identity Confirmed' : 'Connect to Facebook'}
              </button>

              <button 
                onClick={handleSave}
                className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${
                  isSaved ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-white/5 text-gray-500 border-white/5 hover:text-white'
                }`}
              >
                {isSaved ? <Check size={14} /> : <Save size={14} />}
                {isSaved ? 'Vault Updated' : 'Persist Encrypted to Vault'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [unlockedCreds, setUnlockedCreds] = useState<FacebookCredentials | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [showTelegramIngestor, setShowTelegramIngestor] = useState(false);

  const handleSaveCreds = async (creds: FacebookCredentials, masterPass: string) => {
    await VaultService.saveCredentials(creds, masterPass);
    setUnlockedCreds(creds);
  };

  const handleUnlockVault = async (masterPass: string) => {
    const creds = await VaultService.loadCredentials(masterPass);
    if (creds) {
      setUnlockedCreds(creds);
      logEmitter.emit('SYSTEM', 'Vault unlocked.', 'success');
    }
  };

  const handleLockVault = () => {
    setUnlockedCreds(null);
    logEmitter.emit('SYSTEM', 'Vault locked.', 'info');
  };

  const handleNewProperty = (prop: Property) => {
    setProperties(prev => [prop, ...prev]);
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && (
        <div className="space-y-12 animate-in fade-in duration-700">
          {/* Hero Mobile Header */}
          <div className="lg:hidden p-8 rounded-[3rem] bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Target size={120} />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 opacity-70">SaaS Command Center</p>
             <h3 className="text-3xl font-black italic tracking-tighter mb-4">Good morning, <br/>Agent.</h3>
             <button 
                onClick={() => setShowTelegramIngestor(true)}
                className="flex items-center gap-3 px-6 py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-transform"
             >
                <PlusCircle size={18} />
                Sync Telegram
             </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            <StatCard icon={<TrendingUp />} label="ROI" value="RM 0" change="+0%" />
            <StatCard icon={<Home />} label="Active" value={properties.length.toString()} change={`+${properties.length}`} />
            <StatCard icon={<Users />} label="Leads" value="0" change="+0" />
            <StatCard icon={<Activity />} label="Health" value="100%" change="Optimal" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Live Automation Stream</h3>
                <button className="hidden lg:flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95">
                  <PlusCircle size={16} />
                  SYNC TELEGRAM
                </button>
              </div>
              <AutomationLogs />
            </div>
            <div className="space-y-8">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter px-2">Infrastructure</h3>
              <div className="bg-[#111] rounded-[2.5rem] border border-white/5 p-8 space-y-6 shadow-2xl">
                <StatusItem icon={<ShieldCheck className={unlockedCreds ? "text-emerald-500" : "text-gray-600"} />} label="Vault" status={unlockedCreds ? "UNLOCKED" : "LOCKED"} />
                <StatusItem icon={<Globe className="text-blue-500" />} label="Cloud" status="STANDBY" />
                <StatusItem icon={<Zap className="text-yellow-500" />} label="Agent" status="ONLINE" />
                <div className="pt-8 border-t border-white/5">
                   <p className="text-[10px] text-gray-500 uppercase font-black mb-3 tracking-[0.2em]">Session Health</p>
                   <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[95%] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'properties' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl lg:text-2xl font-black text-white uppercase italic tracking-tighter">Inventory</h3>
            <button className="px-6 py-3 bg-white/5 text-white rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest">
              Manual Add
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {properties.length > 0 ? (
              properties.map(p => <PropertyCard key={p.id} property={p} />)
            ) : (
              <div className="col-span-full py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-[#111]/40 flex flex-col items-center justify-center space-y-6">
                <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-gray-700">
                   <Home size={48} />
                </div>
                <div>
                  <h4 className="text-gray-400 font-black text-sm uppercase tracking-[0.3em] italic">Portfolio Empty</h4>
                  <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-widest">Awaiting Telegram sync for ingestion.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <SettingsTab 
          unlockedCreds={unlockedCreds}
          onSave={handleSaveCreds}
          onUnlock={handleUnlockVault}
          onLock={handleLockVault}
        />
      )}

      {showTelegramIngestor && (
        <TelegramIngestor 
          onClose={() => setShowTelegramIngestor(false)} 
          onSuccess={(p) => {
            handleNewProperty(p);
            setShowTelegramIngestor(false);
          }}
          unlockedCreds={unlockedCreds}
        />
      )}
    </Layout>
  );
};

const StatCard = ({ icon, label, value, change }: any) => (
  <div className="bg-[#111] p-6 lg:p-8 rounded-[2rem] border border-white/5 space-y-4 hover:border-blue-500/30 transition-all shadow-xl group active:scale-95">
    <div className="flex items-center justify-between">
      <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">{icon}</div>
      <span className="text-[8px] lg:text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">{change}</span>
    </div>
    <div>
      <p className="text-[9px] lg:text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{label}</p>
      <p className="text-2xl lg:text-3xl font-black text-white mt-1 italic tracking-tighter">{value}</p>
    </div>
  </div>
);

const StatusItem = ({ icon, label, status }: any) => (
  <div className="flex items-center justify-between p-4 rounded-2xl bg-black border border-white/5 group transition-all">
    <div className="flex items-center gap-4">
      <div className="shrink-0">{icon}</div>
      <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{label}</span>
    </div>
    <span className="text-[10px] font-black tracking-widest text-gray-600">{status}</span>
  </div>
);

export default App;
