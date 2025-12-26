
import React, { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, Sparkles, X, Bot, Loader2, CheckCircle, AlertTriangle, RefreshCw, User, MessageCircle, Zap, ShieldAlert, Lock } from 'lucide-react';
import { analyzePropertyMedia, generateAirtopScript } from '../services/geminiService';
import { executeAirtopAutomation } from '../services/automationService';
import { fetchLatestUpdates, getFileUrl, downloadImageAsBase64, sendTelegramMessage, TelegramUpdate } from '../services/telegramService';
import { AutomationStep, PropertyStatus, FacebookCredentials } from '../types';
import { logEmitter } from './AutomationLogs';

interface TelegramIngestorProps {
  onClose: () => void;
  onSuccess: (property: any) => void;
  unlockedCreds: FacebookCredentials | null;
}

const TelegramIngestor: React.FC<TelegramIngestorProps> = ({ onClose, onSuccess, unlockedCreds }) => {
  const [step, setStep] = useState<AutomationStep>('IDLE');
  const [updates, setUpdates] = useState<TelegramUpdate[]>([]);
  const [selectedUpdate, setSelectedUpdate] = useState<TelegramUpdate | null>(null);
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const loadUpdates = async () => {
    setIsLoadingUpdates(true);
    try {
      const results = await fetchLatestUpdates();
      const validUpdates = results.filter(u => u.message);
      setUpdates(validUpdates);
    } catch (err) {
      logEmitter.emit('NETWORK', 'Sync failure', 'error');
    } finally {
      setIsLoadingUpdates(false);
    }
  };

  useEffect(() => {
    loadUpdates();
    const interval = setInterval(loadUpdates, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleManualSelect = async (update: TelegramUpdate) => {
    setSelectedUpdate(update);
    setImagePreview(null);
    setParsedData(null);
    setIsAiThinking(true);
    
    const text = update.message?.text || update.message?.caption || '';
    let base64: string | undefined;

    try {
      const photo = update.message?.photo;
      if (photo && photo.length > 0) {
        const fileId = photo[photo.length - 1].file_id;
        const url = await getFileUrl(fileId);
        base64 = await downloadImageAsBase64(url);
        setImagePreview(base64);
      }
      const result = await analyzePropertyMedia(text, base64?.split(',')[1]);
      setParsedData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiThinking(false);
    }
  };

  const startAutomationPipeline = async () => {
    if (!parsedData || !parsedData.isPropertyListing || !unlockedCreds?.isSet) return;
    
    setStep('AIRTOP_LOGIN');
    logEmitter.emit('AIRTOP', 'Initiating authenticated vault session...', 'info');
    
    try {
      const script = generateAirtopScript(parsedData, unlockedCreds);
      setStep('AIRTOP_EXECUTING');
      await executeAirtopAutomation(script, imagePreview || '');
      
      if (selectedUpdate?.message) {
        await sendTelegramMessage(selectedUpdate.message.chat.id, `✅ *Listing Live!* Vault decryption successful and property published.`);
      }

      setStep('SUCCESS');
      onSuccess({
        ...parsedData,
        id: Math.random().toString(36),
        imageUrl: imagePreview || 'https://picsum.photos/seed/prop/800/600',
        status: PropertyStatus.ACTIVE,
        createdAt: new Date().toISOString(),
        source: 'TELEGRAM'
      });
    } catch (err: any) {
      setError('Airtop execution failed.');
      setStep('ERROR');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#121212] w-full max-w-6xl rounded-[3rem] border border-[#2a2a2a] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        <div className="p-8 border-b border-[#2a2a2a] flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-transparent">
          <div className="flex items-center gap-6">
            <div className="p-4 rounded-3xl bg-blue-600 text-white shadow-xl">
              <Bot size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Enterprise Auto-Pilot</h2>
              <p className="text-[10px] text-blue-400 font-bold tracking-[0.3em]">ENCRYPTED VAULT STREAM</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-gray-600 hover:text-white transition-colors">
            <X size={32} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Live Inbox */}
          <div className="w-1/3 border-r border-[#2a2a2a] flex flex-col bg-black/40">
            <div className="p-6 border-b border-[#2a2a2a] flex items-center justify-between">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                Stream Monitor
              </h3>
              <RefreshCw size={14} className={`text-blue-500 ${isLoadingUpdates ? 'animate-spin' : ''}`} />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {updates.map((upd) => (
                <button
                  key={upd.update_id}
                  onClick={() => handleManualSelect(upd)}
                  className={`w-full text-left p-5 rounded-[2rem] border transition-all duration-300 flex gap-4 items-start ${
                    selectedUpdate?.update_id === upd.update_id 
                    ? 'bg-blue-600 text-white border-blue-400 shadow-lg scale-[1.02]' 
                    : 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-gray-500 text-gray-400'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selectedUpdate?.update_id === upd.update_id ? 'bg-white/20' : 'bg-blue-500/10 text-blue-500'}`}>
                    <User size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[10px] font-black uppercase mb-1 ${selectedUpdate?.update_id === upd.update_id ? 'text-blue-100' : 'text-gray-500'}`}>
                      {upd.message?.from.first_name}
                    </p>
                    <p className={`text-sm truncate font-medium ${selectedUpdate?.update_id === upd.update_id ? 'text-white' : 'text-gray-200'}`}>
                      {upd.message?.text || upd.message?.caption || '🖼️ Photo Content'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Analysis View */}
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            {!unlockedCreds ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="p-6 rounded-[2.5rem] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                  <Lock size={60} />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-white uppercase">Vault Access Required</h4>
                  <p className="max-w-md mx-auto text-sm text-gray-500 mt-2">Credentials are encrypted. Go to <span className="text-blue-500 font-bold">Settings</span> to unlock the secure vault before processing.</p>
                </div>
              </div>
            ) : selectedUpdate ? (
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Property Asset</h4>
                    <div className="aspect-[4/3] rounded-[2.5rem] bg-black border border-[#2a2a2a] overflow-hidden shadow-2xl">
                      {imagePreview ? (
                        <img src={imagePreview} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-800 italic">
                          <ImageIcon size={48} className="mb-2 opacity-10" />
                          <p className="text-[10px]">WAITING FOR MEDIA</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">AI Agent Analysis</h4>
                    <div className="bg-[#0d0d0d] rounded-[2.5rem] p-8 border border-[#2a2a2a] h-full flex flex-col">
                      {isAiThinking ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                          <Loader2 size={40} className="text-blue-500 animate-spin" />
                          <p className="text-xs text-blue-500 font-black animate-pulse">PARSING DATA...</p>
                        </div>
                      ) : parsedData ? (
                        <div className="space-y-6">
                          <div className="bg-[#1a1a1a] p-6 rounded-3xl border border-white/5 italic text-sm text-gray-400">
                            "{parsedData.reply}"
                          </div>
                          <div className="pt-4 border-t border-white/5 space-y-4">
                            <div className="flex justify-between">
                              <span className="text-[10px] font-black text-gray-600 uppercase">Vault Decrypted As:</span>
                              <span className="text-[10px] font-black text-blue-500">{unlockedCreds.email || 'Session Cookies'}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-[9px] text-gray-600 uppercase mb-1">Price Extraction</p>
                                <p className="text-xs font-bold text-gray-300">RM {parsedData.price?.toLocaleString() || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] text-gray-600 uppercase mb-1">Status</p>
                                <p className="text-xs font-bold text-green-500">Validated</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-800 text-sm italic">
                          Select a message to analyze
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {parsedData?.isPropertyListing && (
                  <div className="pt-4">
                    {step === 'IDLE' || step === 'ERROR' ? (
                      <button 
                        onClick={startAutomationPipeline}
                        className="w-full py-8 rounded-[2.5rem] bg-blue-600 text-white font-black text-xl shadow-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-4 group"
                      >
                        <Zap size={32} className="fill-current" />
                        START REAL PUBLISH
                      </button>
                    ) : (
                      <div className="py-10 flex flex-col items-center space-y-6">
                        <Loader2 size={50} className="text-blue-500 animate-spin" />
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                          {step === 'AIRTOP_LOGIN' ? 'Bypassing Login...' : 'Airtop Execution in Progress...'}
                        </h3>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                <Bot size={100} className="mb-6" />
                <h4 className="text-2xl font-black uppercase">Monitoring @Akram_bot</h4>
                <p className="max-w-xs mx-auto text-sm mt-2">Incoming property listings will appear here for authenticated cloud processing.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramIngestor;
