import React, { useState } from 'react';
import { 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Flame, 
  HelpCircle, 
  Plus, 
  Sparkles, 
  Target 
} from 'lucide-react';
import type { StudyPlan } from '../types';
import { toolsService } from '../services/toolsService';
import { memoryService } from '../services/memoryService';

interface StudyPlannerProps {
  activePlan: StudyPlan | null;
  setActivePlan: (plan: StudyPlan) => void;
  onNavigateToQuiz: (topic: string) => void;
  onNavigateToChat: (prompt: string) => void;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({
  activePlan,
  setActivePlan,
  onNavigateToQuiz,
  onNavigateToChat
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [subject, setSubject] = useState('Data Structures & Algorithms');
  const [totalDays, setTotalDays] = useState(7);
  const [hoursPerDay, setHoursPerDay] = useState(2.5);
  const [includeWeakSpots, setIncludeWeakSpots] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const profile = memoryService.getProfile();
  const struggling = memoryService.getStrugglingTopics();

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const focusAreas = includeWeakSpots ? struggling.map(s => s.topicName) : [];
      const plan = toolsService.buildStudyPlan(subject, totalDays, hoursPerDay, focusAreas);
      setActivePlan(plan);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Plan generation failed', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleTask = (dayIndex: number, taskId: string) => {
    if (!activePlan) return;

    const updatedDays = [...activePlan.days];
    const day = updatedDays[dayIndex];
    let toggledToCompleted = false;

    day.tasks = day.tasks.map(task => {
      if (task.id === taskId) {
        const nextState = !task.completed;
        toggledToCompleted = nextState;
        return { ...task, completed: nextState };
      }
      return task;
    });

    // Check if entire day is complete
    day.completed = day.tasks.every(t => t.completed);

    // Calculate total plan completion %
    const totalTasks = updatedDays.reduce((sum, d) => sum + d.tasks.length, 0);
    const completedTasks = updatedDays.reduce((sum, d) => sum + d.tasks.filter(t => t.completed).length, 0);
    const progressPercent = Math.round((completedTasks / totalTasks) * 100);

    const updatedPlan: StudyPlan = {
      ...activePlan,
      days: updatedDays,
      progressPercent
    };

    setActivePlan(updatedPlan);

    // If task was completed, log session into memory
    if (toggledToCompleted) {
      memoryService.logSession(day.focusTitle, 25, 'plan_milestone');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Plan Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold">
              Adaptive Study Planner
            </span>
            <span className="text-xs text-slate-400">&bull; Goal: {profile.targetExamOrGoal}</span>
          </div>

          <h2 className="text-2xl font-bold text-white mt-1">
            {activePlan ? activePlan.title : 'Personalized Learning Roadmaps'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Generates day-by-day syllabi tailored to your exam date, daily available hours, and automatically injects identified weak spots for spaced reinforcement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Plan</span>
          </button>
        </div>
      </div>

      {activePlan ? (
        <div className="space-y-6">
          {/* Progress Overview Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                <span>Roadmap Completion Progress</span>
              </div>
              <span className="text-indigo-400 text-sm">{activePlan.progressPercent}%</span>
            </div>

            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700/60">
              <div
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${activePlan.progressPercent}%` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">Total Days</span>
                <span className="font-bold text-white text-sm">{activePlan.totalDays} Days</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">Daily Target</span>
                <span className="font-bold text-white text-sm">{activePlan.hoursPerDay} hrs/day</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">Target Deadline</span>
                <span className="font-bold text-white text-sm">{activePlan.targetDate}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">Current Streak</span>
                <span className="font-bold text-amber-400 text-sm flex items-center justify-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> {profile.currentStreakDays} Days
                </span>
              </div>
            </div>
          </div>

          {/* Day-by-Day Timeline */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 px-1 flex items-center justify-between">
              <span>Day-by-Day Learning Milestones</span>
              <span className="text-xs text-slate-500">Check off tasks as you study</span>
            </h3>

            <div className="space-y-4">
              {activePlan.days.map((day, dayIndex) => {
                const dayCompleted = day.completed;
                return (
                  <div
                    key={day.dayNumber}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      dayCompleted
                        ? 'bg-slate-900/60 border-emerald-800/50'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Day Banner */}
                    <div className="p-4 bg-slate-950/40 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                            dayCompleted
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-indigo-600 text-white'
                          }`}
                        >
                          {day.dayNumber}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            {day.focusTitle}
                            {dayCompleted && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Completed
                              </span>
                            )}
                          </h4>
                          {day.dateStr && (
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Scheduled: {day.dateStr}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onNavigateToChat(`Explain the concepts for ${day.focusTitle} in detail.`)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                        >
                          Ask AI Tutor
                        </button>
                        <button
                          onClick={() => onNavigateToQuiz(day.focusTitle)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/50 text-xs font-semibold transition"
                        >
                          Take Day Quiz
                        </button>
                      </div>
                    </div>

                    {/* Tasks Checklist */}
                    <div className="p-4 space-y-3">
                      {day.tasks.map(task => (
                        <div
                          key={task.id}
                          onClick={() => handleToggleTask(dayIndex, task.id)}
                          className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer ${
                            task.completed
                              ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-400 line-through'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => {}} // Handled by parent div
                            className="mt-1 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold">{task.title}</span>
                              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {task.estimatedMinutes} mins
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 no-underline">
                              {task.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900 border border-dashed border-slate-800 rounded-2xl space-y-4">
          <Calendar className="w-12 h-12 text-indigo-400 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-white">No Active Study Plan</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Create an AI-generated learning schedule based on your target syllabus, deadline, and daily hours.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
          >
            Create Your First Plan
          </button>
        </div>
      )}

      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Generate Adaptive Study Plan
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGeneratePlan} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Subject or Course</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Algorithms & Data Structures, Cell Biology, Machine Learning"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Duration (Days)</label>
                  <select
                    value={totalDays}
                    onChange={e => setTotalDays(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value={3}>3 Days (Crash Course)</option>
                    <option value={7}>7 Days (1 Week Sprint)</option>
                    <option value={14}>14 Days (2 Weeks)</option>
                    <option value={21}>21 Days (3 Weeks)</option>
                    <option value={30}>30 Days (Full Month)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Study Hours / Day</label>
                  <select
                    value={hoursPerDay}
                    onChange={e => setHoursPerDay(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value={1}>1.0 Hour (Relaxed)</option>
                    <option value={2}>2.0 Hours (Standard)</option>
                    <option value={2.5}>2.5 Hours (Balanced)</option>
                    <option value={4}>4.0 Hours (Intensive)</option>
                  </select>
                </div>
              </div>

              {/* Memory Integration Alert */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                  <input
                    type="checkbox"
                    checked={includeWeakSpots}
                    onChange={e => setIncludeWeakSpots(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Inject identified weak spots from Learner Memory</span>
                </label>
                {includeWeakSpots && struggling.length > 0 && (
                  <p className="text-[11px] text-amber-400 pl-5">
                    Will prioritize: {struggling.map(s => s.topicName).join(', ')}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || !subject.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
                >
                  {isGenerating ? 'Synthesizing Roadmap...' : 'Generate Roadmap'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
