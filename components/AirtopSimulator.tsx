
import React from 'react';
import { Globe, MousePointer2, Keyboard, Layout, Loader2, CheckCircle2 } from 'lucide-react';
import { AutomationStep } from '../types';

interface AirtopSimulatorProps {
  step: AutomationStep;
  progress: number;
}

const AirtopSimulator: React.FC<AirtopSimulatorProps> = ({ step, progress }) => {
  const getStepDetails = () => {
    switch (step) {
      case 'AIRTOP_CONNECT': return { label: 'Initializing Airtop.ai Cloud Browser...', icon: <Globe size={16} /> };
      case 'FB_NAVIGATE': return { label: 'Navigating to Facebook Marketplace...', icon: <Layout size={16} /> };
      case 'FB_FORM_FILL': return { label: 'AI Agent: Filling listing details...', icon: <Keyboard size={16} /> };
      case 'FB_MEDIA_UPLOAD': return { label: 'Uploading watermarked media...', icon: <MousePointer2 size={16} /> };
      case 'COMPLETED': return { label: 'Listing Live on Facebook!', icon: <CheckCircle2 size={16} /> };
      default: return { label: 'Waiting for trigger...', icon: <Loader2 size={16} /> };
    }
  };

  const details = getStepDetails();

  return (
    <div className="bg-[#0f0f0f] rounded-xl border border-blue-500/30 overflow-hidden shadow-2xl shadow-blue-500/10">
      <div className="bg-[#1a1a1a] px-4 py-2 border-b border-[#2a2a2a] flex items-center justify-between">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
        </div>
        <div className="flex items-center gap-2 text-[10px] text-blue-400 font-mono font-bold uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Airtop Session: Active
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
            {details.icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-200">{details.label}</p>
            <div className="mt-2 h-1.5 w-full bg-[#2a2a2a] rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#161616] p-3 rounded-lg border border-[#2a2a2a]">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Browser Engine</p>
            <p className="text-xs text-blue-400 font-mono">Chromium-v122 (Headless)</p>
          </div>
          <div className="bg-[#161616] p-3 rounded-lg border border-[#2a2a2a]">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">IP Rotation</p>
            <p className="text-xs text-green-400 font-mono">Residential: NYC</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirtopSimulator;
