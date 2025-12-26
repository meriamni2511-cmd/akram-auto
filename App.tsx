
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
import { TrendingUp, Users, Target, CheckCircle, Activity, Zap, ShieldCheck, Globe, Key, Eye, EyeOff, Save, Facebook, Check, Database, Lock, Loader2, Unlock, ShieldAlert, LogIn, AlertCircle, RefreshCcw, Home, PlusCircle } from 'lucide-react';
import { Property, PropertyStatus, FacebookCredentials, AuthMethod, PropertyData, AuthFailureReason } from './types';

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
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [diagReport, setDiagReport] = useState<{ reason: AuthFailureReason; message: string } | null>(null);

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
    setDiagReport(null);
    setUnlockError(null);

    if (authMethod === 'credentials' && (!email || !password)) {
      setUnlockError('Email and password are required for direct login.');
      return;
    }
    if (authMethod === 'cookies' && !cookies) {
      setUnlockError('Session cookies are required.');
      return;
    }
    
    setIsVerifying(true);
    logEmitter.emit('SYSTEM', `Running cloud diagnostic for ${authMethod}...`, 'info');
    
    try {
      const result = await automationService.verifyFacebookAuth({ email, password, cookies, authMethod, isSet: true });
      
      if (result.success) {
        logEmitter.emit('AIRTOP', 'Cloud verification passed. Authentication confirmed.', 'success');
        if (masterPass) handleSave();
        alert('Verification Successful: Your Facebook session is active and cloud-ready.');
      } else {
        logEmitter.emit('NETWORK', `Verification Diagnostic: ${result.reason}`, 'error');
        setDiagReport({ reason: result.reason!, message: result.message! });
      }
    } catch (e: any) {
      setUnlockError(`Unexpected Error: ${e.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUnlockRequest = async () => {
    setUnlockError(null);
    try {
      await onUnlock(masterPass);
    } catch (e: any) {
      setUnlockError('Decryption failed. Incorrect Master Password.');
    }
  };

  if (!unlockedCreds && VaultService.hasVault()) {
    return (
      <div className="max-w-md mx-auto py-20 animate-in fade-in zoom-in duration-500">
        <div className="bg-[#1a1a1a] p-10 rounded-[3rem] border border-blue-500/30 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/20">
            <Lock size={40} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Vault Locked</h3>
            <p className="text-xs text-gray-500 mt-2">Enter your Master Password to access Facebook integration.</p>
          </div>
          <div className="space-y-4">
            <input 
              type="password" 
              value={masterPass}
              onChange={(e) => setMasterPass(e.target.value)}
              placeholder="Master Password"
              className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-2xl px-6 py-4 text-white text-center focus:border-blue-500 outline-none transition-all"
            />
            {unlockError && <p className="text-[10px] text-red-500 font-bold uppercase">{unlockError}</p>}
            <button 
              onClick={handleUnlockRequest}
              className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl"
            >
              Unlock Vault
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-white uppercase italic">Security Vault</h3>
          <p className="text-sm text-gray-500">Manage your Facebook automation credentials.</p>
        </div>
        <button onClick={onLock} className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all">
          <Unlock size={20} />
        </button>
      </div>

      <div className="bg-[#1a1a1a] rounded-[2.5rem] border border-[#2a2a2a] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-[#2a2a2a] flex gap-4">
          <button 
            onClick={() => setAuthMethod('credentials')}
            className={`flex-1 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${authMethod === 'credentials' ? 'bg-blue-600 text-white' : 'bg-[#0d0d0d] text-gray-600 hover:text-gray-400'}`}
          >
            Direct Login
          </button>
          <button 
            onClick={() => setAuthMethod('cookies')}
            className={`flex-1 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${authMethod === 'cookies' ? 'bg-blue-600 text-white' : 'bg-[#0d0d0d] text-gray-600 hover:text-gray-400'}`}
          >
            Session Cookies
          </button>
        </div>

        <div className="p-8 space-y-6">
          {authMethod === 'credentials' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">FB Email/Username</label>
                <input 
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none"
                  placeholder="name@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">FB Password</label>
                <div className="relative">
                  <input 
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none pr-12"
                    placeholder="••••••••••••"
                  />
                  <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">JSON Cookie Payload</label>
              <textarea 
                value={cookies}
                onChange={(e) => setCookies(e.target.value)}
                rows={6}
                className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-2xl px-5 py-4 text-white font-mono text-xs focus:border-blue-500 outline-none resize-none"
                placeholder='[{"name": "c_user", "value": "..."}]'
              />
              <p className="text-[10px] text-gray-600 italic">Recommended for accounts with 2FA enabled.</p>
            </div>
          )}

          <div className="pt-4 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Vault Master Password</label>
              <input 
                type="password"
                value={masterPass}
                onChange={(e) => setMasterPass(e.target.value)}
                className="w-full bg-[#0d0d0d] border border-blue-500/30 rounded-2xl px-5 py-4 text-white focus:border-blue-500 outline-none"
                placeholder="Required for encryption"
              />
            </div>

            {diagReport && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex gap-4">
                <ShieldAlert className="text-red-500 shrink-0" />
                <div>
                  <p className="text-xs font-black text-red-500 uppercase">{diagReport.reason}</p>
                  <p className="text-xs text-gray-400 mt-1">{diagReport.message}</p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button 
                onClick={handleLoginAndVerify}
                disabled={isVerifying}
                className="flex-1 py-5 rounded-2xl bg-[#2a2a2a] text-white font-black uppercase tracking-widest hover:bg-[#333] transition-all flex items-center justify-center gap-2"
              >
                {isVerifying ? <Loader2 size={18} className="animate-spin" /> : <RefreshCcw size={18} />}
                Cloud Verify
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-5 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center gap-2"
              >
                {isSaved ? <Check size={18} /> : <Save size={18} />}
                {isSaved ? 'Vault Updated' : 'Save Encrypted'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Fixed missing default export and App component implementation
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
      logEmitter.emit('SYSTEM', 'Vault unlocked successfully.', 'success');
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
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard icon={<TrendingUp />} label="Total Revenue" value="RM 42,500" change="+12.5%" />
            <StatCard icon={<Home />} label="Active Listings" value={properties.length.toString()} change="+3" />
            <StatCard icon={<Users />} label="New Leads" value="18" change="+5" />
            <StatCard icon={<Activity />} label="Bot Health" value="98%" change="Optimal" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Recent Automation Activity</h3>
                <button 
                  onClick={() => setShowTelegramIngestor(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold text-sm"
                >
                  <PlusCircle size={16} />
                  SYNC TELEGRAM
                </button>
              </div>
              <AutomationLogs />
            </div>
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Cloud Status</h3>
              <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6 space-y-4">
                <StatusItem icon={<ShieldCheck className="text-green-500" />} label="Security Vault" status={unlockedCreds ? "Unlocked" : "Locked"} />
                <StatusItem icon={<Globe className="text-blue-500" />} label="Airtop Engine" status="Standby" />
                <StatusItem icon={<Zap className="text-yellow-500" />} label="AI Agent" status="Online" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'properties' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Property Portfolio</h3>
            <button className="px-4 py-2 bg-[#2a2a2a] text-white rounded-lg border border-[#3a3a3a] hover:bg-[#333] transition-all text-sm font-bold">
              + ADD MANUAL
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.length > 0 ? (
              properties.map(p => <PropertyCard key={p.id} property={p} />)
            ) : (
              <div className="col-span-full py-20 text-center text-gray-600 italic">
                No properties indexed yet. Sync from Telegram to get started.
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
  <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#2a2a2a] space-y-4">
    <div className="flex items-center justify-between">
      <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">{icon}</div>
      <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded">{change}</span>
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const StatusItem = ({ icon, label, status }: any) => (
  <div className="flex items-center justify-between p-3 rounded-xl bg-[#252525] border border-white/5">
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-sm text-gray-300">{label}</span>
    </div>
    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">{status}</span>
  </div>
);

export default App;
