// Agent Service: ReAct Reasoning Loop, Context Augmentation, Tool Execution & LLM/Local Synthesis
import type { ChatMessage, Citation, ToolExecution } from '../types';
import { memoryService } from './memoryService';
import { ragService } from './ragService';
import { toolsService } from './toolsService';

const STORAGE_KEY_GEMINI_KEY = 'ai_study_gemini_api_key';
const STORAGE_KEY_MODEL_PREF = 'ai_study_model_preference';

class AgentService {
  public getApiKey(): string {
    return localStorage.getItem(STORAGE_KEY_GEMINI_KEY) || '';
  }

  public setApiKey(key: string): void {
    localStorage.setItem(STORAGE_KEY_GEMINI_KEY, key.trim());
  }

  public getModelPreference(): 'auto' | 'local_only' | 'gemini_only' {
    return (localStorage.getItem(STORAGE_KEY_MODEL_PREF) as any) || 'auto';
  }

  public setModelPreference(pref: 'auto' | 'local_only' | 'gemini_only'): void {
    localStorage.setItem(STORAGE_KEY_MODEL_PREF, pref);
  }

  // Core ReAct Orchestration Loop
  public async processUserMessage(
    userText: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<ChatMessage> {
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const toolExecutions: ToolExecution[] = [];
    const citations: Citation[] = [];
    let thoughtProcess = '';
    let responseText = '';

    const lower = userText.toLowerCase().trim();
    const memoryContext = memoryService.getLearnerContextSummary();

    // 1. Analyze Intent & Determine Tools to Execute
    const isPlanRequest = lower.includes('plan') || lower.includes('schedule') || lower.includes('roadmap') || lower.includes('syllabus');
    const isQuizRequest = lower.includes('quiz') || lower.includes('test me') || lower.includes('assessment') || lower.includes('practice questions');
    const isFlashcardRequest = lower.includes('flashcard') || lower.includes('spaced repetition') || lower.includes('cards');
    const isProgressRequest = lower.includes('progress') || lower.includes('weak spot') || lower.includes('stats') || lower.includes('struggling') || lower.includes('mastery');
    const isExplainRequest = lower.includes('explain') || lower.includes('how does') || lower.includes('what is') || lower.includes('why do') || lower.includes('difference between');

    thoughtProcess = `Analyzing student query: "${userText}"\n`;
    thoughtProcess += `Learner Context: Target "${memoryService.getProfile().targetExamOrGoal}", Pace "${memoryService.getProfile().studyPace}", Struggling Topics: ${memoryService.getStrugglingTopics().map(t => t.topicName).join(', ') || 'None'}.\n`;

    // Tool 1: Progress evaluation if requested or user asks "what should I study"
    if (isProgressRequest || lower.includes('what should i study') || lower.includes('recommend')) {
      thoughtProcess += `Triggering Tool: tool_analyze_progress to review mastery graph.\n`;
      const progressExec = await toolsService.executeTool('tool_analyze_progress', {});
      toolExecutions.push(progressExec);
    }

    // Tool 2: Study Planner if plan requested
    if (isPlanRequest) {
      thoughtProcess += `Triggering Tool: tool_generate_study_plan based on user syllabus/deadlines.\n`;
      const subjectMatch = userText.match(/(?:for|in|about)\s+([A-Za-z0-9\s&]+?)(?:\s+in|\s+for|\s+over|\s+\d+|\.|$)/i);
      const subject = subjectMatch ? subjectMatch[1].trim() : 'Computer Science & Algorithms';
      const daysMatch = userText.match(/(\d+)\s*(?:day|days|week|weeks)/i);
      let totalDays = 7;
      if (daysMatch) {
        const num = parseInt(daysMatch[1], 10);
        totalDays = lower.includes('week') ? num * 7 : num;
      }

      const planExec = await toolsService.executeTool('tool_generate_study_plan', {
        subject,
        totalDays,
        hoursPerDay: memoryService.getProfile().preferredDailyHours,
        focusAreas: memoryService.getStrugglingTopics().map(t => t.topicName)
      });
      toolExecutions.push(planExec);
    }

    // Tool 3: Quiz Generation
    if (isQuizRequest) {
      thoughtProcess += `Triggering Tool: tool_generate_quiz to assess student active recall.\n`;
      const topic = userText.replace(/quiz|test me|assessment|on|about|questions/gi, '').trim() || 'Core Course Concepts';
      const countMatch = userText.match(/(\d+)\s*(?:questions|q)/i);
      const questionCount = countMatch ? parseInt(countMatch[1], 10) : 4;

      const quizExec = await toolsService.executeTool('tool_generate_quiz', {
        topic,
        questionCount,
        difficulty: 'medium'
      });
      toolExecutions.push(quizExec);
    }

    // Tool 4: Flashcard Generation
    if (isFlashcardRequest) {
      thoughtProcess += `Triggering Tool: tool_generate_flashcards for spaced repetition memory consolidation.\n`;
      const topic = userText.replace(/flashcard|flashcards|cards|on|about/gi, '').trim() || 'High Yield Topics';
      const cardExec = await toolsService.executeTool('tool_generate_flashcards', {
        topic,
        count: 4
      });
      toolExecutions.push(cardExec);
    }

    // Tool 5: RAG Course Material Retrieval (Trigger for factual course queries or concept explanations)
    // Run RAG if not strictly just asking for progress stats
    if (!isProgressRequest || isExplainRequest || lower.length > 5) {
      thoughtProcess += `Triggering Tool: tool_search_course_material (RAG) to ground response in uploaded notes/textbooks.\n`;
      const searchQuery = userText.replace(/explain|what is|how does|why|tell me about|quiz me on/gi, '').trim() || userText;
      const ragExec = await toolsService.executeTool('tool_search_course_material', {
        query: searchQuery,
        topK: 3
      });
      toolExecutions.push(ragExec);

      if (ragExec.output.citations && Array.isArray(ragExec.output.citations)) {
        for (const item of ragExec.output.citations) {
          citations.push({
            chunkId: item.chunkId,
            documentTitle: item.documentTitle,
            chapterTitle: item.chapterTitle,
            excerpt: item.excerpt,
            relevanceScore: parseInt(item.relevanceScore, 10) || 75
          });
        }
      }
    }

    // Tool 6: Concept Explainer if user asked for an explanation
    if (isExplainRequest) {
      thoughtProcess += `Triggering Tool: tool_explain_concept for multi-level conceptual scaffolding.\n`;
      const concept = userText.replace(/explain|what is|how does|why do|difference between/gi, '').trim() || 'Core Topic';
      const explainExec = await toolsService.executeTool('tool_explain_concept', {
        concept,
        targetLevel: 'intermediate',
        learningStyle: memoryService.getProfile().learningStyle
      });
      toolExecutions.push(explainExec);
    }

    thoughtProcess += `Tools executed: ${toolExecutions.map(t => t.displayName).join(', ')}. Synthesizing final grounded response.\n`;

    // 2. Synthesize Response (via Gemini API if available & configured, else rich On-Device Local Engine)
    const apiKey = this.getApiKey();
    const modelPref = this.getModelPreference();

    if (apiKey && modelPref !== 'local_only') {
      try {
        responseText = await this.callGeminiApi(userText, memoryContext, toolExecutions, citations, apiKey);
      } catch (err: any) {
        console.warn('Gemini API call failed, falling back to built-in local engine', err);
        responseText = this.synthesizeLocalResponse(userText, toolExecutions, citations);
      }
    } else {
      responseText = this.synthesizeLocalResponse(userText, toolExecutions, citations);
    }

    // Log study activity in memory
    memoryService.logSession(userText.slice(0, 40), 10, 'rag_chat');

    return {
      id: messageId,
      role: 'assistant',
      content: responseText,
      timestamp: new Date().toISOString(),
      toolExecutions,
      citations,
      thoughtProcess
    };
  }

  // Synthesize using built-in On-Device Intelligent Engine
  private synthesizeLocalResponse(
    userText: string,
    toolExecutions: ToolExecution[],
    citations: Citation[]
  ): string {
    const profile = memoryService.getProfile();
    const struggling = memoryService.getStrugglingTopics();
    const lower = userText.toLowerCase();

    // Check for Plan creation
    const planExec = toolExecutions.find(t => t.toolName === 'tool_generate_study_plan');
    if (planExec && planExec.output.plan) {
      const plan = planExec.output.plan;
      return `### 📅 Study Roadmap Generated for ${plan.subject}!

I have created an adaptive **${plan.totalDays}-Day Learning Plan** allocating **${plan.hoursPerDay} hours/day** tailored to your exam target:

- **Target Goal**: ${profile.targetExamOrGoal}
- **Milestones Planned**: ${plan.days.length} daily study modules
- **Personalized Focus**: Prioritizing your weaker areas (${struggling.map(s => s.topicName).join(', ') || 'Foundational topics'})

#### First 3 Days Preview:
${plan.days.slice(0, 3).map((d: any) => `* **${d.focusTitle}**: ${d.tasks[0].title} (${d.tasks[0].estimatedMinutes} min)`).join('\n')}

> 💡 **Tip**: Switch to the **Study Plans** tab in the top navigation to view the full interactive checklist, track your daily milestones, and mark tasks as complete!`;
    }

    // Check for Quiz creation
    const quizExec = toolExecutions.find(t => t.toolName === 'tool_generate_quiz');
    if (quizExec && quizExec.output.quiz) {
      const quiz = quizExec.output.quiz;
      return `### 📝 Diagnostic Quiz Generated: ${quiz.title}

I have generated a **${quiz.difficulty.toUpperCase()}** quiz with **${quiz.questions.length} questions** drawn from your course materials:

- **Topic**: ${quiz.title}
- **Grounded Source**: ${quiz.sourceDocumentTitle || 'Course Library'}
- **Questions Ready**: Multiple Choice with in-depth feedback and explanations

#### Sample Question 1:
> **${quiz.questions[0].question}**
> 1. ${quiz.questions[0].options[0]}
> 2. ${quiz.questions[0].options[1]}
> 3. ${quiz.questions[0].options[2]}
> 4. ${quiz.questions[0].options[3]}

👉 Head over to the **Quizzes & Tests** tab to take the interactive quiz with instant grading, scoring, and automatic mastery graph tracking!`;
    }

    // Check for Flashcards creation
    const flashcardExec = toolExecutions.find(t => t.toolName === 'tool_generate_flashcards');
    if (flashcardExec && flashcardExec.output.flashcards) {
      const cards = flashcardExec.output.flashcards;
      return `### 🗂️ Spaced Repetition Flashcards Generated!

I have created **${cards.length} flashcards** optimized for the Leitner spaced repetition system:

- **Card 1 Front**: "${cards[0].front}"
- **Card 1 Back**: ${cards[0].back}

👉 Visit the **Flashcards** tab to practice them with 3D flip animations and spaced review intervals!`;
    }

    // Check for Progress evaluation
    const progressExec = toolExecutions.find(t => t.toolName === 'tool_analyze_progress');
    if (progressExec && (lower.includes('progress') || lower.includes('weak spot') || lower.includes('how am i doing'))) {
      const out = progressExec.output;
      return `### 🧠 Learner Memory & Progress Diagnostic

Here is the current snapshot from your **Learner Knowledge Graph**:

* **Current Study Streak**: 🔥 **${profile.currentStreakDays} days**
* **Total Study Time**: ⏱️ **${profile.totalHoursStudied} hours**
* **Overall Accuracy Rate**: 🎯 **${profile.accuracyRate}%**
* **Topics Mastered**: ✅ **${out.masteredCount} topics**
* **Struggling / Under Review**: ⚠️ **${out.strugglingCount} topics**

#### Identified Focus Area:
${struggling.length > 0 
  ? `Your lowest score is in **${struggling[0].topicName}** (${struggling[0].proficiencyScore}%). Key bottlenecks: *${struggling[0].keyWeaknesses.join(', ') || 'Concept application'}*.`
  : 'You are performing consistently well across all registered topics!'}

**Recommendation**: ${out.topPriorityRecommendation}`;
    }

    // Grounded RAG response with citations
    if (citations.length > 0) {
      const best = citations[0];
      let answerBody = `Based on **"${best.documentTitle}"** (${best.chapterTitle || 'Core Material'}):\n\n`;

      // Formulate detailed educational answer using chunk content
      answerBody += `${best.excerpt}\n\n`;

      if (citations.length > 1) {
        const second = citations[1];
        answerBody += `Additionally, in **${second.chapterTitle || second.documentTitle}**:\n${second.excerpt}\n\n`;
      }

      // Memory-aware personalization
      if (struggling.length > 0 && struggling.some(s => lower.includes(s.topicName.toLowerCase()))) {
        answerBody += `> 💡 **Memory Note**: Since this connects to your flagged weak area, make sure to pay special attention to the core invariants and boundary conditions!\n\n`;
      }

      answerBody += `**Key Takeaway**: Understanding this principle helps reinforce both theoretical foundations and practical problem-solving. Would you like me to generate a 3-question quick quiz on this or create a study milestone?`;

      return answerBody;
    }

    // Fallback friendly AI tutor response
    return `Hello ${profile.name}! I am your **AI Learning & Study Assistant**. 

I am equipped with:
1. **RAG (Course Material Grounding)**: Ask me anything about your uploaded lectures, notes, or our preloaded Computer Science, Biology, and Machine Learning textbooks.
2. **Personalized Memory**: I track your topic mastery (${profile.accuracyRate}% average), study streak (${profile.currentStreakDays} days), and specific weak spots.
3. **Autonomous Study Tools**: I can build custom **Study Plans**, generate **Interactive Quizzes**, create **Flashcards**, and break down complex concepts.

What subject or exam are we focusing on today?`;
  }

  // Live Google Gemini API Integration (Optional / Fallback)
  private async callGeminiApi(
    userText: string,
    memoryContext: string,
    toolExecutions: ToolExecution[],
    citations: Citation[],
    apiKey: string
  ): Promise<string> {
    const citationsSummary = citations.map((c, i) => 
      `[Source ${i + 1}: ${c.documentTitle} - ${c.chapterTitle || ''}]: "${c.excerpt}"`
    ).join('\n\n');

    const toolsSummary = toolExecutions.map(t => 
      `Tool Executed: ${t.displayName}\nInput: ${JSON.stringify(t.input)}\nOutput: ${JSON.stringify(t.output)}`
    ).join('\n\n');

    const prompt = `You are an empathetic, world-class AI Learning & Study Assistant.
You are powered by RAG (Retrieval-Augmented Generation), Learner Memory, and Executable Study Tools.

LEARNER MEMORY SNAPSHOT:
${memoryContext}

GROUNDED COURSE MATERIAL RETRIEVAL (RAG CITATIONS):
${citationsSummary || 'No direct course excerpts found.'}

EXECUTED AGENT TOOLS:
${toolsSummary || 'No tools executed.'}

STUDENT MESSAGE:
${userText}

INSTRUCTIONS:
1. Provide a clear, encouraging, highly educational response.
2. If RAG citations are provided, cite them directly using brackets like [Document Title, Chapter X] and ground your answer strictly in these facts.
3. If tools were executed (like Study Planner, Quiz, Flashcards), reference their outputs clearly and guide the student on how to use them.
4. Keep the student's learning style and weak areas in mind to personalize the explanation.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 1000
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('No candidate text returned from Gemini API');
    }

    return candidateText;
  }
}

export const agentService = new AgentService();
