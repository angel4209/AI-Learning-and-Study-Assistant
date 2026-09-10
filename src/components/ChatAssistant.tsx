import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  ChevronDown, 
  ChevronRight, 
  ExternalLink, 
  FileText, 
  HelpCircle, 
  Lightbulb, 
  Send, 
  Sparkles, 
  Terminal, 
  User, 
  Wrench 
} from 'lucide-react';
import type { ChatMessage, Citation } from '../types';
import { agentService } from '../services/agentService';

interface ChatAssistantProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onNavigateToTab: (tabId: string) => void;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  messages,
  setMessages,
  onNavigateToTab
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const toggleToolExpand = (id: string) => {
    setExpandedTools(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputText).trim();
    if (!messageContent || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await agentService.processUserMessage(messageContent, messages);
      setMessages(prev => [...prev, response]);
    } catch (err) {
      console.error('Error processing agent message', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'I encountered an unexpected issue while reasoning through your request. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const samplePrompts = [
    { title: 'Explain with Analogy', query: 'Explain Dynamic Programming and memoization using a real-world analogy.' },
    { title: 'RAG Material Search', query: 'What is the difference between BFS and DFS according to the course notes?' },
    { title: 'Generate 7-Day Plan', query: 'Create a 7-day study plan for Machine Learning covering 2 hours per day.' },
    { title: 'Create Quick Quiz', query: 'Generate a 4-question quiz on Big-O Asymptotic Analysis.' },
    { title: 'Review Weak Spots', query: 'What are my current weak spots and recommended study actions?' }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-145px)] max-w-5xl mx-auto px-2 sm:px-4 py-2">
      {/* Top Banner / Assistant Capability Intro */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-900/40 rounded-xl p-3 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              Autonomous AI Study Tutor
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-normal">Active</span>
            </h2>
            <p className="text-xs text-slate-400">
              Grounded in uploaded course materials (RAG) &bull; Knowledge Graph Memory &bull; Automated Quiz & Roadmap Tools
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <button
            onClick={() => onNavigateToTab('materials')}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            📚 View Material Library
          </button>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id || index}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[88%] md:max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                {/* User or Assistant Bubble */}
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20'
                      : 'bg-slate-800/90 text-slate-100 border border-slate-700/70 rounded-tl-none shadow-sm'
                  }`}
                >
                  {/* Markdown-style content formatting */}
                  <div className="space-y-2 whitespace-pre-wrap">
                    {msg.content}
                  </div>

                  {/* Render Grounded RAG Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-700/60">
                      <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Retrieved Course Citations ({msg.citations.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {msg.citations.map((cit, cIdx) => (
                          <button
                            key={cIdx}
                            onClick={() => setSelectedCitation(cit)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-700/50 text-indigo-300 text-xs transition"
                          >
                            <span className="font-semibold">[{cIdx + 1}]</span>
                            <span className="truncate max-w-[160px]">{cit.chapterTitle || cit.documentTitle}</span>
                            <span className="text-[10px] px-1 rounded bg-indigo-800/60 text-indigo-200">
                              {cit.relevanceScore}% match
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Render Executed Tools Inspector */}
                  {msg.toolExecutions && msg.toolExecutions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-700/60">
                      <div className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold mb-2 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-amber-400" />
                        <span>Agent Tools Executed ({msg.toolExecutions.length})</span>
                      </div>
                      <div className="space-y-1.5">
                        {msg.toolExecutions.map((tool, tIdx) => {
                          const toolId = `${msg.id}-tool-${tIdx}`;
                          const isExpanded = expandedTools[toolId];
                          return (
                            <div
                              key={tIdx}
                              className="rounded-lg bg-slate-900/80 border border-slate-700/80 overflow-hidden text-xs"
                            >
                              <button
                                onClick={() => toggleToolExpand(toolId)}
                                className="w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-slate-800/60 transition"
                              >
                                <div className="flex items-center gap-2">
                                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                                  <span className="font-mono text-slate-200">{tool.displayName}</span>
                                </div>
                                <div className="flex items-center gap-1 text-slate-400">
                                  <span className="text-[11px]">{isExpanded ? 'Hide Trace' : 'View Trace'}</span>
                                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                </div>
                              </button>

                              {isExpanded && (
                                <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2 font-mono text-[11px]">
                                  <div className="text-slate-400">
                                    <span className="text-amber-400 font-semibold">Explanation:</span> {tool.explanation}
                                  </div>
                                  <div>
                                    <span className="text-indigo-400 font-semibold">Input:</span>
                                    <pre className="mt-1 p-2 rounded bg-slate-900 overflow-x-auto text-slate-300">
                                      {JSON.stringify(tool.input, null, 2)}
                                    </pre>
                                  </div>
                                  <div>
                                    <span className="text-emerald-400 font-semibold">Output Preview:</span>
                                    <pre className="mt-1 p-2 rounded bg-slate-900 overflow-x-auto text-slate-300">
                                      {JSON.stringify(tool.output, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-500 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-slate-700 flex-shrink-0 flex items-center justify-center text-white shadow-md">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-slate-800/90 border border-slate-700/70 text-slate-300 text-sm flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Analyzing query, retrieving course chunks &amp; executing tools...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="py-2 overflow-x-auto scrollbar-none flex gap-2">
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p.query)}
            disabled={isLoading}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/70 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white text-xs transition disabled:opacity-50"
          >
            <Lightbulb className="w-3 h-3 text-amber-400" />
            <span>{p.title}</span>
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="mt-1 relative bg-slate-900 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition">
        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your course materials, request a study plan, or generate a quiz..."
          rows={2}
          className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none resize-none"
        />

        <div className="flex items-center justify-between px-3 py-2 bg-slate-950/60 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="hidden sm:inline">Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">Enter</kbd> to send</span>
          </div>

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium shadow-md shadow-indigo-600/30 transition"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Citation Inspector Modal */}
      {selectedCitation && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  RAG Citation Detail
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {selectedCitation.chapterTitle || selectedCitation.documentTitle}
                </h3>
                <p className="text-xs text-slate-400">Source: {selectedCitation.documentTitle}</p>
              </div>
              <button
                onClick={() => setSelectedCitation(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap">
              {selectedCitation.excerpt}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>Relevance Score: <strong className="text-emerald-400">{selectedCitation.relevanceScore}%</strong></span>
              <button
                onClick={() => {
                  setSelectedCitation(null);
                  onNavigateToTab('materials');
                }}
                className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
              >
                <span>Inspect in Course Materials</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
