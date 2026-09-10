// Domain Types for AI Learning & Study Assistant
// Architecture: RAG + Memory + Tools

export type SubjectCategory = 'computer_science' | 'biology' | 'machine_learning' | 'general';

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  chapterTitle?: string;
  chunkIndex: number;
  content: string;
  wordCount: number;
  keywords: string[];
}

export interface CourseDocument {
  id: string;
  title: string;
  category: SubjectCategory;
  description: string;
  filename: string;
  uploadedAt: string;
  chunkCount: number;
  contentSummary: string;
  rawContent?: string;
}

export interface RetrievalResult {
  chunk: DocumentChunk;
  score: number;
  matchedKeywords: string[];
}

// Memory Types
export type LearningStyle = 'visual' | 'practical' | 'theoretical' | 'mixed';
export type StudyPace = 'relaxed' | 'balanced' | 'intensive';

export interface LearnerProfile {
  id: string;
  name: string;
  targetExamOrGoal: string;
  targetDate: string; // YYYY-MM-DD
  learningStyle: LearningStyle;
  studyPace: StudyPace;
  preferredDailyHours: number;
  currentStreakDays: number;
  totalHoursStudied: number;
  quizzesCompleted: number;
  accuracyRate: number; // 0-100%
}

export interface TopicMastery {
  topicId: string;
  topicName: string;
  subject: string;
  proficiencyScore: number; // 0 to 100%
  status: 'struggling' | 'learning' | 'mastered';
  lastReviewed: string; // ISO date
  quizzesAttempted: number;
  timesCorrect: number;
  timesIncorrect: number;
  keyWeaknesses: string[];
}

export interface MemoryGraph {
  profile: LearnerProfile;
  topics: Record<string, TopicMastery>;
  identifiedMisconceptions: Array<{
    id: string;
    topic: string;
    description: string;
    identifiedAt: string;
    resolved: boolean;
  }>;
  recentStudySessions: Array<{
    id: string;
    date: string;
    topic: string;
    durationMinutes: number;
    activityType: 'rag_chat' | 'quiz' | 'flashcards' | 'plan_milestone';
  }>;
}

// Tool Calling Types
export type ToolName =
  | 'tool_search_course_material'
  | 'tool_generate_study_plan'
  | 'tool_generate_quiz'
  | 'tool_generate_flashcards'
  | 'tool_explain_concept'
  | 'tool_update_mastery'
  | 'tool_analyze_progress';

export interface ToolExecution {
  toolName: ToolName;
  displayName: string;
  input: Record<string, any>;
  output: Record<string, any>;
  timestamp: string;
  explanation: string;
}

// Chat & Agent Types
export interface Citation {
  chunkId: string;
  documentTitle: string;
  chapterTitle?: string;
  excerpt: string;
  relevanceScore: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolExecutions?: ToolExecution[];
  citations?: Citation[];
  thoughtProcess?: string;
}

// Study Plan Types
export interface DailyTask {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  completed: boolean;
  resourceRef?: string;
  quizTopic?: string;
}

export interface PlanDay {
  dayNumber: number;
  dateStr?: string;
  focusTitle: string;
  tasks: DailyTask[];
  completed: boolean;
}

export interface StudyPlan {
  id: string;
  title: string;
  subject: string;
  targetDate: string;
  hoursPerDay: number;
  totalDays: number;
  days: PlanDay[];
  createdAt: string;
  progressPercent: number;
}

// Quiz Types
export type QuestionType = 'mcq' | 'true_false' | 'conceptual';

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  hint?: string;
  relatedTopic: string;
  sourceChunkId?: string;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  sourceDocumentTitle?: string;
  questions: QuizQuestion[];
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
  lastScore?: number; // 0-100%
  completed?: boolean;
}

export interface QuizSubmission {
  quizId: string;
  userAnswers: Record<number, number>; // questionIndex -> selectedOptionIndex
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  completedAt: string;
  feedbackByQuestion: Array<{
    questionIndex: number;
    isCorrect: boolean;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
    topic: string;
  }>;
}

// Flashcard Types
export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  hint?: string;
  topic: string;
  sourceRef?: string;
  box: number; // Leitner box (1 to 5)
  intervalDays: number;
  nextReviewDate: string;
  repetitions: number;
  easeFactor: number;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  subject: string;
  cardCount: number;
  cards: Flashcard[];
}

export const TYPES_VERSION = '1.0.0';

