import React, { useState } from 'react';
import { 
  AlertCircle, 
  BrainCircuit, 
  CheckCircle, 
  Clock, 
  Edit3, 
  Flame, 
  RefreshCw, 
  Save, 
  Sparkles, 
  Target, 
  TrendingUp, 
  User 
} from 'lucide-react';
import type { LearnerProfile, MemoryGraph, TopicMastery } from '../types';
import { memoryService } from '../services/memoryService';

interface LearnerMemoryDashboardProps {
  onNavigateToChat: (prompt: string) => void;
  onNavigateToQuiz: (topic: string) => void;
}

export const LearnerMemoryDashboard: React.FC<LearnerMemoryDashboardProps> = ({
  onNavigateToChat,
  onNavigateToQuiz
}) => {
  const [memory, setMemory] = useState<MemoryGraph>(() => memoryService.getMemoryGraph());
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<LearnerProfile>(memory.profile);

  const refreshMemory = () => {
    const updated = memoryService.getMemoryGraph();
    setMemory(updated);
    setEditedProfile(updated.profile);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    memoryService.updateProfile(editedProfile);
    refreshMemory();
    setIsEditingProfile(false);
  };

  const handleResolveMisconception = (id: string) => {
    memoryService.resolveMisconception(id);
    refreshMemory();
  };

  const topicsList = Object.values(memory.topics);
  const strugglingTopics = topicsList.filter(t => t.status === 'struggling');
  const masteredTopics = topicsList.filter(t => t.status === 'mastered');
  const learningTopics = topicsList.filter(t => t.status === 'learning');

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold">
              Cognitive Knowledge Graph
            </span>
            <span className="text-xs text-slate-400">&bull; Persistent Learner Memory</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Student Profile &amp; Knowledge Graph</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Tracks topic proficiency, isolates persistent misconceptions, and tailors all AI responses and quizzes to your learning style.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshMemory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh State</span>
          </button>
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      {/* Profile Overview Card / Editor */}
      {isEditingProfile ? (
        <form onSubmit={handleSaveProfile} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <h3 className="text-base font-bold text-white">Edit Learner Profile &amp; Study Parameters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Student Name</label>
              <input
                type="text"
                value={editedProfile.name}
                onChange={e => setEditedProfile({ ...editedProfile, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Target Exam / Goal</label>
              <input
                type="text"
                value={editedProfile.targetExamOrGoal}
                onChange={e => setEditedProfile({ ...editedProfile, targetExamOrGoal: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Target Exam Date</label>
              <input
                type="date"
                value={editedProfile.targetDate}
                onChange={e => setEditedProfile({ ...editedProfile, targetDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Learning Style</label>
              <select
                value={editedProfile.learningStyle}
                onChange={e => setEditedProfile({ ...editedProfile, learningStyle: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="visual">Visual (Diagrams &amp; Analogies)</option>
                <option value="practical">Practical (Code &amp; Exercises)</option>
                <option value="theoretical">Theoretical (Formal Invariants)</option>
                <option value="mixed">Mixed Multimodal</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Study Pace</label>
              <select
                value={editedProfile.studyPace}
                onChange={e => setEditedProfile({ ...editedProfile, studyPace: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="relaxed">Relaxed (1 hr/day)</option>
                <option value="balanced">Balanced (2-3 hrs/day)</option>
                <option value="intensive">Intensive (4+ hrs/day)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Daily Study Target (Hours)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="10"
                value={editedProfile.preferredDailyHours}
                onChange={e => setEditedProfile({ ...editedProfile, preferredDailyHours: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-500 block">Learner</span>
            <span className="text-base font-bold text-white block mt-0.5">{memory.profile.name}</span>
            <span className="text-[11px] text-indigo-400 capitalize">{memory.profile.learningStyle} Learner</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-500 block">Target Goal</span>
            <span className="text-sm font-bold text-white block mt-0.5 truncate">{memory.profile.targetExamOrGoal}</span>
            <span className="text-[11px] text-slate-400">Exam: {memory.profile.targetDate}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-500 block">Current Streak</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="text-base font-bold text-amber-400">{memory.profile.currentStreakDays} Days</span>
            </div>
            <span className="text-[11px] text-slate-500">{memory.profile.totalHoursStudied} Hours Total</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-500 block">Cumulative Mastery</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span className="text-base font-bold text-emerald-400">{memory.profile.accuracyRate}%</span>
            </div>
            <span className="text-[11px] text-slate-500">{memory.profile.quizzesCompleted} Quizzes Taken</span>
          </div>
        </div>
      )}

      {/* Identified Misconceptions & Bottlenecks */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Identified Misconceptions &amp; Weak Spots</h3>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            {memory.identifiedMisconceptions.filter(m => !m.resolved).length} Unresolved
          </span>
        </div>

        <p className="text-xs text-slate-400">
          The agent monitors missed questions and confused explanations to log specific conceptual misunderstandings here.
        </p>

        {memory.identifiedMisconceptions.length > 0 ? (
          <div className="space-y-3">
            {memory.identifiedMisconceptions.map(misc => (
              <div
                key={misc.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  misc.resolved
                    ? 'bg-slate-950/40 border-slate-800 opacity-60'
                    : 'bg-amber-950/20 border-amber-900/50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{misc.topic}</span>
                    {misc.resolved ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Resolved</span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">Needs Review</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">{misc.description}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => onNavigateToChat(`Explain the misconception regarding "${misc.topic}": ${misc.description}`)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/50 text-xs font-medium transition"
                  >
                    Remediate with AI
                  </button>
                  {!misc.resolved && (
                    <button
                      onClick={() => handleResolveMisconception(misc.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/50 text-xs font-medium transition"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-slate-500 text-xs bg-slate-950 rounded-xl">
            No active misconceptions recorded! Great job keeping concepts clear.
          </div>
        )}
      </div>

      {/* Topic Mastery Progress Graph */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Topic Mastery Graph</h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {masteredTopics.length} Mastered
            </span>
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {learningTopics.length} Learning
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
              {strugglingTopics.length} Struggling
            </span>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {topicsList.map(topic => {
            let statusColor = 'bg-indigo-500';
            let badgeStyle = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
            if (topic.status === 'mastered') {
              statusColor = 'bg-emerald-500';
              badgeStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            } else if (topic.status === 'struggling') {
              statusColor = 'bg-rose-500';
              badgeStyle = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
            }

            return (
              <div key={topic.topicId} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="text-sm font-bold text-white">{topic.topicName}</span>
                    <span className="text-xs text-slate-500 ml-2">({topic.subject})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${badgeStyle}`}>
                      {topic.status}
                    </span>
                    <span className="text-sm font-bold text-white">{topic.proficiencyScore}%</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${statusColor} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${topic.proficiencyScore}%` }}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 pt-1 gap-2">
                  <span>
                    {topic.quizzesAttempted} Quizzes &bull; {topic.timesCorrect} Correct &bull; {topic.timesIncorrect} Missed
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigateToQuiz(topic.topicName)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      Quiz Topic &rarr;
                    </button>
                    <button
                      onClick={() => onNavigateToChat(`I want to practice ${topic.topicName}. Explain the tricky parts.`)}
                      className="text-xs text-slate-400 hover:text-slate-200"
                    >
                      Ask Tutor &rarr;
                    </button>
                  </div>
                </div>

                {topic.keyWeaknesses.length > 0 && (
                  <div className="pt-2 border-t border-slate-900 text-[11px] text-rose-400">
                    ⚠️ Weakness: {topic.keyWeaknesses.join('; ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Study Sessions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          Recent Study Activity Log
        </h3>

        <div className="space-y-2">
          {memory.recentStudySessions.slice(0, 6).map(sess => (
            <div
              key={sess.id}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span className="font-semibold text-white">{sess.topic}</span>
                <span className="text-slate-500 capitalize">({sess.activityType.replace('_', ' ')})</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <span>{sess.durationMinutes} mins</span>
                <span>{new Date(sess.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
