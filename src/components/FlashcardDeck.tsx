import React, { useState } from 'react';
import { 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  HelpCircle, 
  Layers, 
  Plus, 
  RotateCw, 
  Sparkles, 
  Star 
} from 'lucide-react';
import type { Flashcard } from '../types';
import { toolsService } from '../services/toolsService';
import { memoryService } from '../services/memoryService';

interface FlashcardDeckProps {
  onNavigateToChat: (prompt: string) => void;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ onNavigateToChat }) => {
  const [topic, setTopic] = useState('Data Structures & Algorithms');
  const [cards, setCards] = useState<Flashcard[]>(() => toolsService.buildFlashcards('Data Structures', 5));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);

  const currentCard: Flashcard | undefined = cards[currentIdx];

  const handleGenerateCards = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    try {
      const generated = toolsService.buildFlashcards(topic, 5);
      setCards(generated);
      setCurrentIdx(0);
      setIsFlipped(false);
      setShowHint(false);
      setShowGeneratorModal(false);
      setMasteredCount(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRateCard = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentCard) return;

    let nextBox = currentCard.box;
    if (rating === 'easy') {
      nextBox = Math.min(5, nextBox + 2);
      setMasteredCount(prev => prev + 1);
      memoryService.recordTopicPerformance(currentCard.topic, true, 'Flashcard Spaced Repetition');
    } else if (rating === 'good') {
      nextBox = Math.min(5, nextBox + 1);
      memoryService.recordTopicPerformance(currentCard.topic, true, 'Flashcard Spaced Repetition');
    } else if (rating === 'again') {
      nextBox = 1;
      memoryService.recordTopicPerformance(currentCard.topic, false, 'Flashcard Spaced Repetition', 'Flagged as needs review in flashcards');
    }

    // Move to next card
    if (currentIdx < cards.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setIsFlipped(false);
      setShowHint(false);
    } else {
      // Completed deck!
      memoryService.logSession(`Flashcard Deck: ${topic}`, 10, 'flashcards');
      alert(`🎉 Flashcard deck completed! You reviewed ${cards.length} cards.`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-semibold">
              Spaced Repetition Flashcards
            </span>
            <span className="text-xs text-slate-400">&bull; Leitner 5-Box Method</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">{topic}</h2>
          <p className="text-xs text-slate-400 mt-1">
            Active recall with scheduled spaced repetition. Click any card to flip.
          </p>
        </div>

        <button
          onClick={() => setShowGeneratorModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Deck</span>
        </button>
      </div>

      {cards.length > 0 && currentCard ? (
        <div className="space-y-6">
          {/* Deck Stats & Progress Bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Card {currentIdx + 1} of {cards.length}</span>
            <div className="flex items-center gap-2">
              <span className="text-indigo-400 font-semibold">Leitner Box {currentCard.box} / 5</span>
              <span className="text-slate-500">&bull;</span>
              <span className="text-emerald-400">{masteredCount} Mastered</span>
            </div>
          </div>

          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-purple-500 h-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / cards.length) * 100}%` }}
            />
          </div>

          {/* 3D Flipping Card Container */}
          <div className="perspective-1000 w-full min-h-[320px] cursor-pointer" onClick={() => setIsFlipped(prev => !prev)}>
            <div
              className={`relative w-full min-h-[320px] transition-transform duration-500 transform-style-preserve-3d rounded-3xl p-8 shadow-2xl flex flex-col justify-between border ${
                isFlipped
                  ? 'rotate-y-180 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border-indigo-500/60'
                  : 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              {!isFlipped ? (
                /* Card Front (Question / Term) */
                <div className="flex flex-col justify-between h-full space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-indigo-400 border border-slate-700">
                      {currentCard.topic}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5" /> Click to Flip
                    </span>
                  </div>

                  <div className="text-center py-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
                      {currentCard.front}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/80 pt-3">
                    {currentCard.sourceRef && (
                      <span>Source: {currentCard.sourceRef}</span>
                    )}
                    {currentCard.hint && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowHint(prev => !prev);
                        }}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{showHint ? currentCard.hint : 'Show Hint'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Card Back (Answer & Explanation) */
                <div className="rotate-y-180 flex flex-col justify-between h-full space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Answer &amp; Concept
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5" /> Click to Flip Front
                    </span>
                  </div>

                  <div className="py-4">
                    <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                      {currentCard.back}
                    </p>
                  </div>

                  <div className="border-t border-slate-800/80 pt-3 flex justify-between items-center text-xs text-slate-400">
                    <span>Topic: {currentCard.topic}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToChat(`Explain "${currentCard.front}" in more depth with code or diagrams.`);
                      }}
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      Ask AI Tutor &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Spaced Repetition Rating Controls */}
          {isFlipped && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-400 block text-center">
                How well did you remember this concept? (Determines next review interval)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  onClick={() => handleRateCard('again')}
                  className="py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-bold transition flex flex-col items-center gap-0.5"
                >
                  <span>❌ Again</span>
                  <span className="text-[10px] text-rose-400/80">&lt; 1 day (Box 1)</span>
                </button>

                <button
                  onClick={() => handleRateCard('hard')}
                  className="py-2.5 px-3 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 text-xs font-bold transition flex flex-col items-center gap-0.5"
                >
                  <span>⚠️ Hard</span>
                  <span className="text-[10px] text-amber-400/80">1 day review</span>
                </button>

                <button
                  onClick={() => handleRateCard('good')}
                  className="py-2.5 px-3 rounded-xl bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/60 text-blue-300 text-xs font-bold transition flex flex-col items-center gap-0.5"
                >
                  <span>👍 Good</span>
                  <span className="text-[10px] text-blue-400/80">3 days review</span>
                </button>

                <button
                  onClick={() => handleRateCard('easy')}
                  className="py-2.5 px-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 text-xs font-bold transition flex flex-col items-center gap-0.5"
                >
                  <span>⭐ Easy</span>
                  <span className="text-[10px] text-emerald-400/80">5+ days (Box 5)</span>
                </button>
              </div>
            </div>
          )}

          {/* Previous / Next Manual Navigation */}
          <div className="flex items-center justify-between text-xs">
            <button
              onClick={() => {
                setCurrentIdx(prev => Math.max(0, prev - 1));
                setIsFlipped(false);
              }}
              disabled={currentIdx === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 font-medium transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Card</span>
            </button>

            <button
              onClick={() => {
                setCurrentIdx(prev => Math.min(cards.length - 1, prev + 1));
                setIsFlipped(false);
              }}
              disabled={currentIdx === cards.length - 1}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 font-medium transition"
            >
              <span>Next Card</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900 border border-dashed border-slate-800 rounded-2xl">
          <Layers className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Flashcards Loaded</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Generate an AI-powered spaced repetition deck for any topic from your course materials.
          </p>
          <button
            onClick={() => setShowGeneratorModal(true)}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            Create Flashcard Deck
          </button>
        </div>
      )}

      {/* Generator Modal */}
      {showGeneratorModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Generate Flashcards with RAG
              </h3>
              <button
                onClick={() => setShowGeneratorModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateCards} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Topic or Document Focus
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. Asymptotic Notation, Cell Organelles, Neural Networks"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGeneratorModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || !topic.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold"
                >
                  {isGenerating ? 'Generating Cards...' : 'Generate Deck'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
