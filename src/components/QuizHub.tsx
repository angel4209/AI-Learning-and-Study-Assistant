import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  AlertTriangle, 
  Award, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  HelpCircle, 
  Play, 
  Plus, 
  RotateCcw, 
  Sparkles, 
  XCircle 
} from 'lucide-react';
import type { CourseDocument, Quiz, QuizQuestion, QuizSubmission } from '../types';
import { toolsService } from '../services/toolsService';
import { memoryService } from '../services/memoryService';

interface QuizHubProps {
  documents: CourseDocument[];
  onNavigateToMemory: () => void;
  onNavigateToChat: (prompt: string) => void;
  prefillTopic?: string;
}

export const QuizHub: React.FC<QuizHubProps> = ({
  documents,
  onNavigateToMemory,
  onNavigateToChat,
  prefillTopic
}) => {
  const [topic, setTopic] = useState(prefillTopic || 'Data Structures & Big-O Analysis');
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [showHint, setShowHint] = useState<Record<number, boolean>>({});
  const [submissionResult, setSubmissionResult] = useState<QuizSubmission | null>(null);

  const handleGenerateQuiz = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    try {
      const quiz = toolsService.buildQuiz(topic, questionCount, difficulty, selectedDocId || undefined);
      setActiveQuiz(quiz);
      setCurrentQuestionIdx(0);
      setSelectedAnswers({});
      setShowExplanation({});
      setShowHint({});
      setSubmissionResult(null);
    } catch (err) {
      console.error('Quiz generation error', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (submissionResult) return; // already completed

    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIdx]: optionIndex
    }));

    // Reveal explanation immediately for active recall learning
    setShowExplanation(prev => ({
      ...prev,
      [currentQuestionIdx]: true
    }));
  };

  const handleFinishQuiz = () => {
    if (!activeQuiz) return;

    let correctCount = 0;
    const feedbackList = activeQuiz.questions.map((q, idx) => {
      const userAnswerIdx = selectedAnswers[idx];
      const isCorrect = userAnswerIdx === q.correctAnswerIndex;
      if (isCorrect) correctCount++;

      // Automatically sync performance with Learner Memory Graph!
      memoryService.recordTopicPerformance(
        q.relatedTopic || activeQuiz.title,
        isCorrect,
        activeQuiz.subject,
        isCorrect ? undefined : `Missed question: "${q.question}"`
      );

      // If incorrect, flag potential misconception in memory
      if (!isCorrect) {
        memoryService.addMisconception(
          q.relatedTopic,
          `Missed "${q.question.slice(0, 60)}...". Selected: "${q.options[userAnswerIdx] || 'None'}", Correct: "${q.options[q.correctAnswerIndex]}".`
        );
      }

      return {
        questionIndex: idx,
        isCorrect,
        userAnswer: userAnswerIdx !== undefined ? q.options[userAnswerIdx] : 'Unanswered',
        correctAnswer: q.options[q.correctAnswerIndex],
        explanation: q.explanation,
        topic: q.relatedTopic
      };
    });

    const scorePercent = Math.round((correctCount / activeQuiz.questions.length) * 100);

    const submission: QuizSubmission = {
      quizId: activeQuiz.id,
      userAnswers: selectedAnswers,
      scorePercent,
      correctCount,
      totalQuestions: activeQuiz.questions.length,
      completedAt: new Date().toISOString(),
      feedbackByQuestion: feedbackList
    };

    setSubmissionResult(submission);
    memoryService.incrementQuizzesCompleted();
    memoryService.logSession(activeQuiz.title, 15, 'quiz');

    // Trigger celebration confetti if score is >= 75%
    if (scorePercent >= 75) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }
    }
  };

  const currentQ: QuizQuestion | undefined = activeQuiz?.questions[currentQuestionIdx];
  const hasAnsweredCurrent = selectedAnswers[currentQuestionIdx] !== undefined;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Quiz Hub Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
              Assessment Engine
            </span>
            <span className="text-xs text-slate-400">&bull; Grounded in RAG Chunks</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Interactive Quizzes &amp; Active Recall</h2>
          <p className="text-xs text-slate-400 mt-1">
            Test comprehension, discover misconceptions, and automatically feed results into your personalized Knowledge Graph.
          </p>
        </div>

        {activeQuiz && (
          <button
            onClick={() => {
              setActiveQuiz(null);
              setSubmissionResult(null);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold self-start md:self-auto transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Quiz</span>
          </button>
        )}
      </div>

      {!activeQuiz ? (
        /* Generator View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Generate Custom Assessment
          </h3>

          <form onSubmit={handleGenerateQuiz} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Quiz Topic or Key Concept
              </label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Dynamic Programming, Big-O Analysis, Cell Organelles, Gradient Descent"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Source Course Material
                </label>
                <select
                  value={selectedDocId}
                  onChange={e => setSelectedDocId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Any Indexed Course Material</option>
                  {documents.map(d => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Number of Questions
                </label>
                <select
                  value={questionCount}
                  onChange={e => setQuestionCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={3}>3 Questions (Quick Check)</option>
                  <option value={4}>4 Questions (Standard)</option>
                  <option value={6}>6 Questions (Deep Dive)</option>
                  <option value={10}>10 Questions (Exam Simulation)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="easy">Easy (Definitions &amp; Syntax)</option>
                  <option value="medium">Medium (Application &amp; Analysis)</option>
                  <option value="hard">Hard (Edge Cases &amp; Optimization)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isGenerating || !topic.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Extracting RAG Chunks &amp; Formulating Questions...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Generate &amp; Start Quiz</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Start Cards */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-400 mb-3">Popular Recommended Quizzes:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { title: 'Big-O Asymptotic Complexity', sub: 'Computer Science', count: 4, diff: 'medium' },
                { title: 'Central Dogma & Transcription', sub: 'Biology', count: 4, diff: 'easy' },
                { title: 'Gradient Descent & Optimizers', sub: 'Machine Learning', count: 4, diff: 'hard' }
              ].map((rec, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setTopic(rec.title);
                    setDifficulty(rec.diff as any);
                    setQuestionCount(rec.count);
                    handleGenerateQuiz();
                  }}
                  className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition"
                >
                  <span className="text-xs font-bold text-white block">{rec.title}</span>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>{rec.sub}</span>
                    <span className="text-indigo-400 font-medium capitalize">{rec.diff}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : submissionResult ? (
        /* Submission Results & Feedback View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="text-center space-y-3 py-4 border-b border-slate-800">
            <div className="w-16 h-16 rounded-full mx-auto bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center text-white shadow-lg">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Quiz Completed!</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Results automatically synced to your <strong>Learner Knowledge Graph</strong>.
              </p>
            </div>

            <div className="inline-flex items-center gap-4 px-6 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-sm">
              <div>
                <span className="text-xs text-slate-500 block">Score</span>
                <span className={`text-xl font-bold ${submissionResult.scorePercent >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {submissionResult.scorePercent}%
                </span>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div>
                <span className="text-xs text-slate-500 block">Correct</span>
                <span className="text-xl font-bold text-white">
                  {submissionResult.correctCount} / {submissionResult.totalQuestions}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setActiveQuiz(null);
                setSubmissionResult(null);
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              Take Another Quiz
            </button>
            <button
              onClick={onNavigateToMemory}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
            >
              View Updated Memory Graph &rarr;
            </button>
          </div>

          {/* Detailed Question Review */}
          <div className="space-y-4 pt-4">
            <h4 className="text-sm font-bold text-slate-200 px-1">Detailed Explanations &amp; Answers:</h4>
            {submissionResult.feedbackByQuestion.map((fb, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border ${
                  fb.isCorrect
                    ? 'bg-emerald-950/20 border-emerald-800/40'
                    : 'bg-rose-950/20 border-rose-800/40'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {fb.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-1.5 text-xs">
                    <span className="font-bold text-white text-sm">
                      Question {i + 1}: {activeQuiz.questions[i].question}
                    </span>
                    <div className="text-slate-300">
                      <span className="text-slate-400">Your Answer: </span>
                      <strong className={fb.isCorrect ? 'text-emerald-300' : 'text-rose-300'}>
                        {fb.userAnswer}
                      </strong>
                    </div>
                    {!fb.isCorrect && (
                      <div className="text-slate-300">
                        <span className="text-slate-400">Correct Answer: </span>
                        <strong className="text-emerald-300">{fb.correctAnswer}</strong>
                      </div>
                    )}
                    <p className="text-slate-400 pt-1 text-[11px] leading-relaxed border-t border-slate-800/80">
                      <span className="text-indigo-400 font-semibold">Explanation: </span>
                      {fb.explanation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Active Quiz Question Runner */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {/* Header with progress */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
            <span className="font-semibold text-indigo-400">
              Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}
            </span>
            <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              Topic: {currentQ?.relatedTopic || activeQuiz.title}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full transition-all duration-300"
              style={{ width: `${((currentQuestionIdx + 1) / activeQuiz.questions.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          {currentQ && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white leading-relaxed">
                {currentQ.question}
              </h3>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentQuestionIdx] === optIdx;
                  const isCorrect = optIdx === currentQ.correctAnswerIndex;
                  const hasAnswered = hasAnsweredCurrent;

                  let optionStyle = 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200';
                  if (hasAnswered) {
                    if (isCorrect) {
                      optionStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-semibold';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'bg-rose-950/40 border-rose-500 text-rose-200';
                    }
                  } else if (isSelected) {
                    optionStyle = 'bg-indigo-950/40 border-indigo-500 text-indigo-200';
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition flex items-center justify-between ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {hasAnswered && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                      {hasAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Hint Trigger */}
              {currentQ.hint && !hasAnsweredCurrent && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowHint(prev => ({ ...prev, [currentQuestionIdx]: !prev[currentQuestionIdx] }))}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showHint[currentQuestionIdx] ? 'Hide Hint' : 'Need a Hint?'}</span>
                  </button>

                  {showHint[currentQuestionIdx] && (
                    <div className="mt-2 p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs text-amber-300">
                      💡 <strong>Hint:</strong> {currentQ.hint}
                    </div>
                  )}
                </div>
              )}

              {/* Immediate Feedback Box after Answer */}
              {hasAnsweredCurrent && (
                <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-indigo-300">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Answer Explanation</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIdx === 0}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-xs font-medium transition"
                >
                  &larr; Previous
                </button>

                {currentQuestionIdx < activeQuiz.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                    disabled={!hasAnsweredCurrent}
                    className="flex items-center gap-1 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleFinishQuiz}
                    disabled={!hasAnsweredCurrent}
                    className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition"
                  >
                    <span>Submit &amp; View Results</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
