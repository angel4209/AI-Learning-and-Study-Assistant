import React, { useState } from 'react';
import { 
  Check, 
  Key, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles, 
  Zap 
} from 'lucide-react';
import { agentService } from '../services/agentService';
import { memoryService } from '../services/memoryService';
import { ragService } from '../services/ragService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshAll: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onRefreshAll
}) => {
  const [apiKey, setApiKey] = useState(() => agentService.getApiKey());
  const [modelPref, setModelPref] = useState<'auto' | 'local_only' | 'gemini_only'>(() => agentService.getModelPreference());
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    agentService.setApiKey(apiKey);
    agentService.setModelPreference(modelPref);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
      onRefreshAll();
    }, 800);
  };

  const handleResetAll = () => {
    if (confirm('Reset all course documents and student memory back to initial factory state?')) {
      ragService.resetToSamples();
      memoryService.resetMemory();
      onRefreshAll();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">System &amp; AI Engine Settings</h3>
              <p className="text-xs text-slate-400">RAG + Memory + Tools Orchestrator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Engine Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              AI Execution Engine
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label
                className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-2.5 ${
                  modelPref === 'auto' || modelPref === 'local_only'
                    ? 'bg-indigo-950/40 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="modelPref"
                  checked={modelPref === 'auto' || modelPref === 'local_only'}
                  onChange={() => setModelPref('auto')}
                  className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="font-bold block flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Built-in Local Engine
                  </span>
                  <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                    Zero setup, runs 100% offline in browser, instant response.
                  </span>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-2.5 ${
                  modelPref === 'gemini_only'
                    ? 'bg-purple-950/40 border-purple-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="modelPref"
                  checked={modelPref === 'gemini_only'}
                  onChange={() => setModelPref('gemini_only')}
                  className="mt-0.5 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="font-bold block flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Google Gemini 1.5
                  </span>
                  <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                    Cloud LLM generation via Google Generative Language API.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Gemini API Key */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                Google Gemini API Key (Optional)
              </label>
              <span className="text-[10px] text-slate-500">Stored in your browser only</span>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="AIzaSy... (Leave empty to use built-in engine)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              If left blank, the assistant works entirely on-device using our embedded vector retrieval, cognitive memory graph, and rule-based NLP generators!
            </p>
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Privacy Guaranteed:</strong> All uploaded documents, vector chunks, study schedules, and quiz answers are stored locally in your browser storage.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetAll}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Factory Data</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Configuration</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
