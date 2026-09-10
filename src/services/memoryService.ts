// Learner Memory Service: Student Profile, Topic Mastery Graph, Misconceptions & Study History
import type { LearnerProfile, MemoryGraph, TopicMastery } from '../types';

const STORAGE_KEY_MEMORY = 'ai_study_memory_graph';

const DEFAULT_PROFILE: LearnerProfile = {
  id: 'user-default-1',
  name: 'Alex Chen',
  targetExamOrGoal: 'Midterm Exam & Software Engineering Interviews',
  targetDate: new Date(Date.now() + 86400000 * 21).toISOString().split('T')[0], // 3 weeks out
  learningStyle: 'visual',
  studyPace: 'balanced',
  preferredDailyHours: 2.5,
  currentStreakDays: 4,
  totalHoursStudied: 18.5,
  quizzesCompleted: 6,
  accuracyRate: 78
};

const DEFAULT_TOPICS: Record<string, TopicMastery> = {
  'big-o-analysis': {
    topicId: 'big-o-analysis',
    topicName: 'Big-O Asymptotic Analysis',
    subject: 'Computer Science',
    proficiencyScore: 88,
    status: 'mastered',
    lastReviewed: new Date(Date.now() - 86400000 * 1).toISOString(),
    quizzesAttempted: 5,
    timesCorrect: 9,
    timesIncorrect: 1,
    keyWeaknesses: []
  },
  'dynamic-programming': {
    topicId: 'dynamic-programming',
    topicName: 'Dynamic Programming & Memoization',
    subject: 'Computer Science',
    proficiencyScore: 42,
    status: 'struggling',
    lastReviewed: new Date(Date.now() - 86400000 * 2).toISOString(),
    quizzesAttempted: 4,
    timesCorrect: 3,
    timesIncorrect: 5,
    keyWeaknesses: ['Identifying overlapping subproblems in multi-dimensional states', 'State transition equations']
  },
  'binary-search-trees': {
    topicId: 'binary-search-trees',
    topicName: 'Binary Search Trees & AVL Balance',
    subject: 'Computer Science',
    proficiencyScore: 75,
    status: 'learning',
    lastReviewed: new Date(Date.now() - 86400000 * 3).toISOString(),
    quizzesAttempted: 3,
    timesCorrect: 6,
    timesIncorrect: 2,
    keyWeaknesses: ['Tree rotation mechanics']
  },
  'central-dogma-transcription': {
    topicId: 'central-dogma-transcription',
    topicName: 'Central Dogma & Transcription',
    subject: 'Biology',
    proficiencyScore: 92,
    status: 'mastered',
    lastReviewed: new Date(Date.now() - 86400000 * 4).toISOString(),
    quizzesAttempted: 4,
    timesCorrect: 8,
    timesIncorrect: 1,
    keyWeaknesses: []
  },
  'gradient-descent-optimizers': {
    topicId: 'gradient-descent-optimizers',
    topicName: 'Gradient Descent & Adaptive Optimizers',
    subject: 'Machine Learning',
    proficiencyScore: 64,
    status: 'learning',
    lastReviewed: new Date(Date.now() - 86400000 * 2).toISOString(),
    quizzesAttempted: 3,
    timesCorrect: 5,
    timesIncorrect: 3,
    keyWeaknesses: ['Second moment estimation in Adam optimizer']
  }
};

class MemoryService {
  private memory: MemoryGraph = {
    profile: DEFAULT_PROFILE,
    topics: DEFAULT_TOPICS,
    identifiedMisconceptions: [
      {
        id: 'misc-1',
        topic: 'Dynamic Programming',
        description: 'Confused top-down memoization with bottom-up tabulation space complexity optimizations.',
        identifiedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        resolved: false
      }
    ],
    recentStudySessions: [
      {
        id: 'sess-1',
        date: new Date(Date.now() - 86400000 * 1).toISOString(),
        topic: 'Big-O Analysis',
        durationMinutes: 45,
        activityType: 'quiz'
      },
      {
        id: 'sess-2',
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        topic: 'Dynamic Programming',
        durationMinutes: 60,
        activityType: 'rag_chat'
      }
    ]
  };

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const data = localStorage.getItem(STORAGE_KEY_MEMORY);
      if (data) {
        this.memory = JSON.parse(data);
      } else {
        this.persist();
      }
    } catch (e) {
      console.warn('Failed to load memory from localStorage', e);
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY_MEMORY, JSON.stringify(this.memory));
    } catch (e) {
      console.error('Failed to persist memory graph', e);
    }
  }

  public getMemoryGraph(): MemoryGraph {
    return JSON.parse(JSON.stringify(this.memory));
  }

  public getProfile(): LearnerProfile {
    return { ...this.memory.profile };
  }

  public updateProfile(updates: Partial<LearnerProfile>): void {
    this.memory.profile = { ...this.memory.profile, ...updates };
    this.persist();
  }

  public getTopics(): TopicMastery[] {
    return Object.values(this.memory.topics);
  }

  public getStrugglingTopics(): TopicMastery[] {
    return Object.values(this.memory.topics).filter(t => t.status === 'struggling' || t.proficiencyScore < 60);
  }

  public getMasteredTopics(): TopicMastery[] {
    return Object.values(this.memory.topics).filter(t => t.status === 'mastered' || t.proficiencyScore >= 80);
  }

  // Record quiz or learning performance to update mastery
  public recordTopicPerformance(
    topicName: string,
    isCorrect: boolean,
    subject: string = 'General',
    weaknessNote?: string
  ): TopicMastery {
    const key = topicName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = this.memory.topics[key] || {
      topicId: key,
      topicName,
      subject,
      proficiencyScore: 50,
      status: 'learning',
      lastReviewed: new Date().toISOString(),
      quizzesAttempted: 0,
      timesCorrect: 0,
      timesIncorrect: 0,
      keyWeaknesses: []
    };

    existing.quizzesAttempted += 1;
    existing.lastReviewed = new Date().toISOString();

    if (isCorrect) {
      existing.timesCorrect += 1;
      // Boost score
      existing.proficiencyScore = Math.min(100, existing.proficiencyScore + 10);
    } else {
      existing.timesIncorrect += 1;
      // Decrease score
      existing.proficiencyScore = Math.max(10, existing.proficiencyScore - 12);
      if (weaknessNote && !existing.keyWeaknesses.includes(weaknessNote)) {
        existing.keyWeaknesses.push(weaknessNote);
      }
    }

    // Determine status
    if (existing.proficiencyScore >= 80) {
      existing.status = 'mastered';
    } else if (existing.proficiencyScore <= 55) {
      existing.status = 'struggling';
    } else {
      existing.status = 'learning';
    }

    this.memory.topics[key] = existing;

    // Update overall learner profile stats
    const allTopics = Object.values(this.memory.topics);
    const avgScore = allTopics.reduce((sum, t) => sum + t.proficiencyScore, 0) / (allTopics.length || 1);
    this.memory.profile.accuracyRate = Math.round(avgScore);

    this.persist();
    return existing;
  }

  public addMisconception(topic: string, description: string): void {
    this.memory.identifiedMisconceptions.unshift({
      id: `misc-${Date.now()}`,
      topic,
      description,
      identifiedAt: new Date().toISOString(),
      resolved: false
    });
    this.persist();
  }

  public resolveMisconception(id: string): void {
    const item = this.memory.identifiedMisconceptions.find(m => m.id === id);
    if (item) {
      item.resolved = true;
      this.persist();
    }
  }

  public logSession(topic: string, durationMinutes: number, activityType: 'rag_chat' | 'quiz' | 'flashcards' | 'plan_milestone'): void {
    this.memory.recentStudySessions.unshift({
      id: `sess-${Date.now()}`,
      date: new Date().toISOString(),
      topic,
      durationMinutes,
      activityType
    });

    this.memory.profile.totalHoursStudied = Number((this.memory.profile.totalHoursStudied + durationMinutes / 60).toFixed(1));
    this.persist();
  }

  public incrementQuizzesCompleted(): void {
    this.memory.profile.quizzesCompleted += 1;
    this.persist();
  }

  public resetMemory(): void {
    this.memory = {
      profile: DEFAULT_PROFILE,
      topics: DEFAULT_TOPICS,
      identifiedMisconceptions: [],
      recentStudySessions: []
    };
    this.persist();
  }

  // Synthesizes a structured memory snapshot to be provided to the AI Agent / Tutor
  public getLearnerContextSummary(): string {
    const struggling = this.getStrugglingTopics().map(t => `${t.topicName} (${t.proficiencyScore}%)`);
    const mastered = this.getMasteredTopics().map(t => `${t.topicName} (${t.proficiencyScore}%)`);
    const misconceptions = this.memory.identifiedMisconceptions.filter(m => !m.resolved).map(m => `[${m.topic}]: ${m.description}`);

    return `Learner Profile:
- Student Name: ${this.memory.profile.name}
- Target Goal / Exam: ${this.memory.profile.targetExamOrGoal} (Deadline: ${this.memory.profile.targetDate})
- Learning Style: ${this.memory.profile.learningStyle} | Pace: ${this.memory.profile.studyPace}
- Daily Study Target: ${this.memory.profile.preferredDailyHours} hrs | Streak: ${this.memory.profile.currentStreakDays} days
- Overall Mastery Average: ${this.memory.profile.accuracyRate}%
- Struggling Topics to reinforce: ${struggling.length > 0 ? struggling.join(', ') : 'None currently flagged'}
- Mastered Topics: ${mastered.length > 0 ? mastered.join(', ') : 'None yet'}
- Unresolved Misconceptions: ${misconceptions.length > 0 ? misconceptions.join('; ') : 'None recorded'}`;
  }
}

export const memoryService = new MemoryService();
