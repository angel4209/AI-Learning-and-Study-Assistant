import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatAssistant } from './components/ChatAssistant';
import { CourseMaterials } from './components/CourseMaterials';
import { StudyPlanner } from './components/StudyPlanner';
import { QuizHub } from './components/QuizHub';
import { FlashcardDeck } from './components/FlashcardDeck';
import { LearnerMemoryDashboard } from './components/LearnerMemoryDashboard';
import { SettingsModal } from './components/SettingsModal';
import type { ChatMessage, CourseDocument, LearnerProfile, StudyPlan } from './types';
import { ragService } from './services/ragService';
import { memoryService } from './services/memoryService';
import { toolsService } from './services/toolsService';
import { agentService } from './services/agentService';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [documents, setDocuments] = useState<CourseDocument[]>(() => ragService.getDocuments());
  const [profile, setProfile] = useState<LearnerProfile>(() => memoryService.getProfile());
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(() => {
    // Generate initial sample 7-day plan if none exists
    const struggling = memoryService.getStrugglingTopics();
    return toolsService.buildStudyPlan('Data Structures & Algorithms', 7, 2.5, struggling.map(s => s.topicName));
  });

  const [quizPrefillTopic, setQuizPrefillTopic] = useState<string>('');
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Initial welcome message from AI Tutor
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `👋 Hello ${profile.name}! I am your **AI Learning & Study Assistant**.

I am built on an autonomous **RAG + Memory + Tools** architecture:
- 📚 **Course Materials (RAG)**: I search through your indexed textbooks (Computer Science, Biology, Machine Learning) and cite exact chapter sections.
- 🧠 **Learner Memory**: I track your topic mastery (${profile.accuracyRate}% average), study streak (${profile.currentStreakDays} days), and flagged weak spots (like *Dynamic Programming*).
- 🛠️ **Autonomous Tools**: I generate custom study plans, active recall quizzes, and Leitner flashcards on command.

How can I accelerate your learning today? Try asking:
* *"Explain Dynamic Programming and memoization using an analogy"*
* *"Create a 7-day study roadmap for my Midterm Exam"*
* *"Generate a 4-question quiz on Big-O Asymptotic Analysis"*
* *"What are my current weak spots?"*`,
      timestamp: new Date().toISOString()
    }
  ]);

  const refreshAll = () => {
    setDocuments(ragService.getDocuments());
    setProfile(memoryService.getProfile());
  };

  const handleAskAboutDoc = (title: string) => {
    setActiveTab('chat');
    const prompt = `Can you provide a comprehensive summary and key takeaways of the course material "${title}"?`;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    agentService.processUserMessage(prompt, messages).then(resp => {
      setMessages(prev => [...prev, resp]);
    });
  };

  const handleNavigateToQuiz = (topic: string) => {
    setQuizPrefillTopic(topic);
    setActiveTab('quizzes');
  };

  const handleNavigateToChat = (prompt: string) => {
    setActiveTab('chat');
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    agentService.processUserMessage(prompt, messages).then(resp => {
      setMessages(prev => [...prev, resp]);
    });
  };

  const hasApiKey = Boolean(agentService.getApiKey());

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        hasApiKey={hasApiKey}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Main Tab Content */}
      <main className="flex-1 pb-8">
        {activeTab === 'chat' && (
          <ChatAssistant
            messages={messages}
            setMessages={setMessages}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'materials' && (
          <CourseMaterials
            documents={documents}
            onRefreshDocs={refreshAll}
            onAskAboutDoc={handleAskAboutDoc}
          />
        )}

        {activeTab === 'planner' && (
          <StudyPlanner
            activePlan={activePlan}
            setActivePlan={setActivePlan}
            onNavigateToQuiz={handleNavigateToQuiz}
            onNavigateToChat={handleNavigateToChat}
          />
        )}

        {activeTab === 'quizzes' && (
          <QuizHub
            documents={documents}
            onNavigateToMemory={() => setActiveTab('memory')}
            onNavigateToChat={handleNavigateToChat}
            prefillTopic={quizPrefillTopic}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardDeck
            onNavigateToChat={handleNavigateToChat}
          />
        )}

        {activeTab === 'memory' && (
          <LearnerMemoryDashboard
            onNavigateToChat={handleNavigateToChat}
            onNavigateToQuiz={handleNavigateToQuiz}
          />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onRefreshAll={refreshAll}
      />
    </div>
  );
}

export default App;
