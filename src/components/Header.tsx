import React from 'react';
import { 
  BookOpen, 
  BrainCircuit, 
  Calendar, 
  CheckSquare, 
  Flame, 
  Layers, 
  MessageSquare, 
  Settings, 
  Sparkles, 
  Target 
} from 'lucide-react';
import type { LearnerProfile } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: LearnerProfile;
  hasApiKey: boolean;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  profile,
  hasApiKey,
  onOpenSettings
}) => {
  const tabs = [
    { id: 'chat', label: 'AI Tutor (RAG)', icon: MessageSquare },
    { id: 'materials', label: 'Course Materials', icon: BookOpen },
    { id: 'planner', label: 'Study Plans', icon: Calendar },
    { id: 'quizzes', label: 'Quizzes & Tests', icon: CheckSquare },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'memory', label: 'Memory & Mastery', icon: BrainCircuit }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Mission */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  StudyAI <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-medium">RAG + Memory + Tools</span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Intelligent Course Assistant &bull; Adaptive Roadmaps &bull; Active Recall
              </p>
            </div>
          </div>

          {/* Mobile settings trigger */}
          <button
            onClick={onOpenSettings}
            className="md:hidden p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Learner Performance Snapshot */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-amber-400 text-xs font-semibold whitespace-nowrap">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
            <span>{profile.currentStreakDays} Day Streak</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-emerald-400 text-xs font-semibold whitespace-nowrap">
            <Target className="w-4 h-4 text-emerald-500" />
            <span>{profile.accuracyRate}% Mastery</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-indigo-400 text-xs font-medium whitespace-nowrap">
            <span>⏱️ {profile.totalHoursStudied}h Studied</span>
          </div>

          {/* Model Status Pill */}
          <button
            onClick={onOpenSettings}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              hasApiKey
                ? 'bg-purple-950/40 text-purple-300 border-purple-800/60 hover:bg-purple-900/40'
                : 'bg-blue-950/40 text-blue-300 border-blue-800/60 hover:bg-blue-900/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{hasApiKey ? '✨ Gemini 1.5 Live' : '⚡ On-Device Engine'}</span>
            <Settings className="w-3.5 h-3.5 ml-1 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto mt-3 overflow-x-auto scrollbar-none">
        <nav className="flex space-x-1 border-b border-slate-800/80 pb-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
