// Agent Tools Suite: Executable Tools for RAG, Study Planning, Quiz Generation, Flashcards & Progress Analysis
import type { Flashcard, Quiz, QuizQuestion, StudyPlan, ToolExecution, ToolName } from '../types';
import { memoryService } from './memoryService';
import { ragService } from './ragService';

export interface ToolDefinition {
  name: ToolName;
  displayName: string;
  description: string;
  parameters: Record<string, { type: string; description: string; required?: boolean }>;
}

export const AVAILABLE_TOOLS: ToolDefinition[] = [
  {
    name: 'tool_search_course_material',
    displayName: 'Course Material Retriever (RAG)',
    description: 'Searches uploaded lecture notes, textbooks, and course documents using hybrid semantic and keyword retrieval.',
    parameters: {
      query: { type: 'string', description: 'The semantic search query or concept to look up', required: true },
      topK: { type: 'number', description: 'Number of relevant chunks to retrieve (default: 3)' },
      documentId: { type: 'string', description: 'Optional ID of a specific document to filter by' }
    }
  },
  {
    name: 'tool_generate_study_plan',
    displayName: 'Adaptive Study Planner',
    description: 'Generates a personalized, day-by-day study roadmap based on target exam deadline, daily available hours, and topic difficulty.',
    parameters: {
      subject: { type: 'string', description: 'Subject or course title', required: true },
      totalDays: { type: 'number', description: 'Number of days until the goal/exam', required: true },
      hoursPerDay: { type: 'number', description: 'Target study hours per day' },
      focusAreas: { type: 'string[]', description: 'Specific topics or weak areas to prioritize' }
    }
  },
  {
    name: 'tool_generate_quiz',
    displayName: 'Quiz & Assessment Generator',
    description: 'Generates a customized interactive quiz with multiple choice, true/false, or conceptual questions and comprehensive explanations.',
    parameters: {
      topic: { type: 'string', description: 'Subject topic to quiz on', required: true },
      questionCount: { type: 'number', description: 'Number of questions (e.g. 3, 5, or 10)' },
      difficulty: { type: 'string', description: 'easy | medium | hard' },
      sourceDocumentId: { type: 'string', description: 'Optional course document to draw questions directly from' }
    }
  },
  {
    name: 'tool_generate_flashcards',
    displayName: 'Spaced Repetition Flashcard Generator',
    description: 'Creates a deck of flashcards formatted for Leitner spaced repetition with memory hooks and conceptual breakdowns.',
    parameters: {
      topic: { type: 'string', description: 'Topic to create flashcards for', required: true },
      count: { type: 'number', description: 'Number of flashcards to generate (default: 5)' }
    }
  },
  {
    name: 'tool_explain_concept',
    displayName: 'Concept Explainer (Feynman Technique)',
    description: 'Produces a multi-tiered conceptual explanation utilizing intuitive real-world analogies, formal definitions, and pitfalls.',
    parameters: {
      concept: { type: 'string', description: 'Concept to explain', required: true },
      targetLevel: { type: 'string', description: 'beginner | intermediate | advanced' },
      learningStyle: { type: 'string', description: 'visual | practical | theoretical' }
    }
  },
  {
    name: 'tool_update_mastery',
    displayName: 'Memory & Mastery Tracker',
    description: 'Updates the learner knowledge graph and topic mastery scores after study sessions or quiz attempts.',
    parameters: {
      topicName: { type: 'string', description: 'The topic assessed', required: true },
      isCorrect: { type: 'boolean', description: 'Whether the learner demonstrated understanding', required: true },
      weaknessNote: { type: 'string', description: 'Specific misconception or confusion observed' }
    }
  },
  {
    name: 'tool_analyze_progress',
    displayName: 'Progress & Weak Spots Evaluator',
    description: 'Evaluates learner performance across all topics, identifies bottlenecks, and suggests the highest-impact study activities.',
    parameters: {}
  }
];

class ToolsService {
  // Execute tool by name
  public async executeTool(name: ToolName, input: Record<string, any>): Promise<ToolExecution> {
    const timestamp = new Date().toISOString();
    let output: Record<string, any> = {};
    let explanation = '';
    let displayName = AVAILABLE_TOOLS.find(t => t.name === name)?.displayName || name;

    switch (name) {
      case 'tool_search_course_material': {
        const query = input.query || '';
        const topK = input.topK || 3;
        const documentId = input.documentId;
        const results = ragService.searchCourseMaterials(query, topK, documentId);

        output = {
          query,
          matchCount: results.length,
          citations: results.map(r => ({
            chunkId: r.chunk.id,
            documentTitle: r.chunk.documentTitle,
            chapterTitle: r.chunk.chapterTitle,
            relevanceScore: Math.round(r.score * 100) + '%',
            excerpt: r.chunk.content.slice(0, 260) + '...'
          }))
        };
        explanation = `Retrieved ${results.length} relevant course excerpts for "${query}". Highest confidence: ${results[0] ? Math.round(results[0].score * 100) + '%' : '0%'}.`;
        break;
      }

      case 'tool_generate_study_plan': {
        const subject = input.subject || 'Core Subjects';
        const totalDays = Math.min(60, Math.max(3, Number(input.totalDays) || 7));
        const hoursPerDay = Number(input.hoursPerDay) || 2;
        const focusAreas = input.focusAreas || [];

        const plan = this.buildStudyPlan(subject, totalDays, hoursPerDay, focusAreas);
        output = { plan };
        explanation = `Created a structured ${totalDays}-day study roadmap for ${subject} allocating ${hoursPerDay}h/day with ${plan.days.length} daily milestones.`;
        break;
      }

      case 'tool_generate_quiz': {
        const topic = input.topic || 'General Review';
        const questionCount = Math.min(10, Math.max(3, Number(input.questionCount) || 4));
        const difficulty = (input.difficulty as 'easy' | 'medium' | 'hard') || 'medium';
        const sourceDocId = input.sourceDocumentId;

        const quiz = this.buildQuiz(topic, questionCount, difficulty, sourceDocId);
        output = { quiz };
        explanation = `Generated a ${difficulty}-level quiz with ${quiz.questions.length} questions on "${topic}".`;
        break;
      }

      case 'tool_generate_flashcards': {
        const topic = input.topic || 'Key Concepts';
        const count = Math.min(10, Math.max(3, Number(input.count) || 4));
        const flashcards = this.buildFlashcards(topic, count);
        output = { flashcards };
        explanation = `Generated ${flashcards.length} spaced repetition flashcards for "${topic}".`;
        break;
      }

      case 'tool_explain_concept': {
        const concept = input.concept || 'Core Concept';
        const level = input.targetLevel || 'intermediate';
        const style = input.learningStyle || memoryService.getProfile().learningStyle;
        const explanationData = this.buildConceptExplanation(concept, level, style);
        output = explanationData;
        explanation = `Generated conceptual explanation for "${concept}" tailored for ${level} level using a ${style} learning style.`;
        break;
      }

      case 'tool_update_mastery': {
        const topicName = input.topicName || 'General Topic';
        const isCorrect = Boolean(input.isCorrect);
        const weaknessNote = input.weaknessNote;
        const updated = memoryService.recordTopicPerformance(topicName, isCorrect, 'Assessed Topic', weaknessNote);
        output = { updatedMastery: updated };
        explanation = `Updated mastery for "${topicName}": new score ${updated.proficiencyScore}% (${updated.status.toUpperCase()}).`;
        break;
      }

      case 'tool_analyze_progress': {
        const struggling = memoryService.getStrugglingTopics();
        const mastered = memoryService.getMasteredTopics();
        const profile = memoryService.getProfile();
        output = {
          overallAccuracy: profile.accuracyRate + '%',
          currentStreak: profile.currentStreakDays + ' days',
          totalHours: profile.totalHoursStudied + ' hrs',
          strugglingCount: struggling.length,
          masteredCount: mastered.length,
          topPriorityRecommendation: struggling.length > 0
            ? `Reinforce "${struggling[0].topicName}" with a 5-question remedial quiz.`
            : 'Knowledge mastery is strong! Proceed with advance modules.'
        };
        explanation = `Analyzed learner knowledge graph: ${mastered.length} topics mastered, ${struggling.length} flagged for review.`;
        break;
      }

      default:
        output = { error: `Tool ${name} not recognized` };
        explanation = `Unrecognized tool execution`;
    }

    return {
      toolName: name,
      displayName,
      input,
      output,
      timestamp,
      explanation
    };
  }

  // Study Plan Builder
  public buildStudyPlan(
    subject: string,
    totalDays: number,
    hoursPerDay: number,
    focusAreas: string[] = []
  ): StudyPlan {
    const planId = `plan-${Date.now()}`;
    const today = new Date();

    // Default modules based on subject
    let modulePool = [
      { title: 'Core Principles & Asymptotics', desc: 'Read fundamental definitions, establish mental model, and review core properties.' },
      { title: 'Data Structures & Representations', desc: 'Compare structural tradeoffs, memory representations, and access patterns.' },
      { title: 'Search & Traversal Algorithms', desc: 'Step through execution traces, boundary cases, and call stacks.' },
      { title: 'Optimization & Dynamic Decisions', desc: 'Identify overlapping subproblems, formulate state equations, and optimize space.' },
      { title: 'Advanced Applications & Synthesis', desc: 'Combine multiple primitives to tackle complex multi-step scenarios.' },
      { title: 'Targeted Remediation & Weak Spots', desc: 'Deep dive into previously missed questions and edge cases.' },
      { title: 'Comprehensive Exam Simulation', desc: 'Timed mock assessment under exam conditions with rubric evaluation.' }
    ];

    if (focusAreas.length > 0) {
      const customModules = focusAreas.map(f => ({
        title: `Deep Focus: ${f}`,
        desc: `Targeted review, exercises, and diagnostic self-testing for ${f}.`
      }));
      modulePool = [...customModules, ...modulePool];
    }

    const days = Array.from({ length: totalDays }, (_, i) => {
      const dayNum = i + 1;
      const targetDate = new Date(today.getTime() + 86400000 * (dayNum - 1));
      const mod = modulePool[i % modulePool.length];

      return {
        dayNumber: dayNum,
        dateStr: targetDate.toISOString().split('T')[0],
        focusTitle: `Day ${dayNum}: ${mod.title}`,
        completed: false,
        tasks: [
          {
            id: `task-${dayNum}-1`,
            title: `Study Session: ${mod.title}`,
            description: mod.desc,
            estimatedMinutes: Math.round(hoursPerDay * 40),
            completed: false,
            resourceRef: subject
          },
          {
            id: `task-${dayNum}-2`,
            title: `Active Recall & Flashcard Review`,
            description: 'Flip through key terms and verify retention using spaced repetition.',
            estimatedMinutes: 20,
            completed: false
          },
          {
            id: `task-${dayNum}-3`,
            title: `Checkpoint Quiz for Day ${dayNum}`,
            description: 'Take an instant 5-question quiz to test understanding and update memory graph.',
            estimatedMinutes: Math.round(hoursPerDay * 20),
            completed: false,
            quizTopic: mod.title
          }
        ]
      };
    });

    const plan: StudyPlan = {
      id: planId,
      title: `${subject} Accelerated Mastery Plan`,
      subject,
      targetDate: new Date(today.getTime() + 86400000 * totalDays).toISOString().split('T')[0],
      hoursPerDay,
      totalDays,
      days,
      createdAt: new Date().toISOString(),
      progressPercent: 0
    };

    return plan;
  }

  // Quiz Builder
  public buildQuiz(
    topic: string,
    questionCount: number = 4,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    sourceDocumentId?: string
  ): Quiz {
    const quizId = `quiz-${Date.now()}`;
    // Query RAG engine for relevant chunks to ground questions in actual course materials!
    const retrieved = ragService.searchCourseMaterials(topic, 3, sourceDocumentId);
    const questions: QuizQuestion[] = [];

    // Check if we matched specific course chunks
    if (retrieved.length > 0) {
      for (let i = 0; i < questionCount; i++) {
        const refChunk = retrieved[i % retrieved.length].chunk;
        const qData = this.generateQuestionFromChunk(refChunk, i + 1, difficulty);
        questions.push(qData);
      }
    } else {
      // Fallback questions for the topic
      questions.push(
        {
          id: `q-gen-1`,
          question: `In the study of ${topic}, what is the primary purpose of applying asymptotic analysis?`,
          type: 'mcq',
          options: [
            'To measure the exact number of CPU cycles on specific hardware',
            'To characterize algorithm scalability and growth rate as input size approaches infinity',
            'To minimize the number of lines of source code in the implementation',
            'To compile the code into machine bytecode faster'
          ],
          correctAnswerIndex: 1,
          explanation: 'Asymptotic analysis characterizes how execution time or space requirements scale asymptotically with input size n, independent of specific hardware or compilers.',
          hint: 'Think about what happens as n grows arbitrarily large.',
          relatedTopic: topic
        },
        {
          id: `q-gen-2`,
          question: `Which of the following statements about ${topic} is generally TRUE?`,
          type: 'mcq',
          options: [
            'Worst-case bounds provide guarantees that performance will not degrade further for any valid input',
            'Memory constraints never influence algorithm design tradeoffs',
            'Empirical benchmarks on 10 items always prove general algorithmic complexity',
            'Recursion always utilizes less stack memory than iterative solutions'
          ],
          correctAnswerIndex: 0,
          explanation: 'Worst-case asymptotic bounds (like Big-O) establish a mathematically provable ceiling on runtime for all possible inputs of size n.',
          hint: 'Consider mathematical guarantees vs empirical observations.',
          relatedTopic: topic
        },
        {
          id: `q-gen-3`,
          question: `True or False: In ${topic}, caching or memoizing intermediate results trades increased space complexity for decreased time complexity.`,
          type: 'true_false',
          options: ['True', 'False'],
          correctAnswerIndex: 0,
          explanation: 'True. Memoization stores solutions to overlapping subproblems in auxiliary memory (space), avoiding redundant recalculations and dramatically reducing time complexity.',
          hint: 'Consider the classic time-space tradeoff.',
          relatedTopic: topic
        },
        {
          id: `q-gen-4`,
          question: `What fundamental property ensures that an optimal global solution can be constructed from optimal subproblem solutions?`,
          type: 'mcq',
          options: [
            'Asymptotic Convergence',
            'Optimal Substructure',
            'Greedy Stagnation',
            'Deterministic Randomness'
          ],
          correctAnswerIndex: 1,
          explanation: 'Optimal substructure is the property where an optimal solution to the overall problem directly incorporates optimal solutions to its subproblems.',
          hint: 'Key prerequisite for Dynamic Programming and Greedy algorithms.',
          relatedTopic: topic
        }
      );
    }

    return {
      id: quizId,
      title: `${topic} Assessment (${difficulty.toUpperCase()})`,
      subject: retrieved[0]?.chunk.documentTitle || topic,
      sourceDocumentTitle: retrieved[0]?.chunk.documentTitle,
      questions: questions.slice(0, questionCount),
      difficulty,
      createdAt: new Date().toISOString()
    };
  }

  private generateQuestionFromChunk(
    chunk: { id: string; documentTitle: string; chapterTitle?: string; content: string; keywords: string[] },
    index: number,
    difficulty: 'easy' | 'medium' | 'hard'
  ): QuizQuestion {
    const text = chunk.content;

    if (text.includes('Big-O') || text.includes('Asymptotic')) {
      return {
        id: `q-${chunk.id}-${index}`,
        question: 'Which of the following time complexities represents the fastest (most optimal) growth rate as input size n grows?',
        type: 'mcq',
        options: ['O(n log n)', 'O(log n)', 'O(n)', 'O(n^2)'],
        correctAnswerIndex: 1,
        explanation: 'O(log n) grows far slower than linear O(n) or linearithmic O(n log n). For example, log2(1,000,000) is approximately 20 operations.',
        hint: 'Think of binary search dividing the search space in half.',
        relatedTopic: 'Big-O Asymptotic Analysis',
        sourceChunkId: chunk.id
      };
    }

    if (text.includes('Linked Lists') || text.includes('Arrays')) {
      return {
        id: `q-${chunk.id}-${index}`,
        question: 'Why do contiguous Arrays typically outperform Linked Lists during sequential iterations on modern processors?',
        type: 'mcq',
        options: [
          'Arrays use dynamic garbage collection at every index',
          'Arrays enjoy superior CPU cache spatial locality because contiguous elements are loaded together into cache lines',
          'Linked lists store elements in hardware registers directly',
          'Linked lists require quadratic O(n^2) time to move to the next pointer'
        ],
        correctAnswerIndex: 1,
        explanation: 'Because array elements reside in adjacent memory addresses, the CPU hardware prefetcher loads entire cache lines simultaneously, drastically reducing cache misses compared to pointer chasing in linked lists.',
        hint: 'Consider hardware architecture and L1/L2 cache lines.',
        relatedTopic: 'Arrays and Linked Lists',
        sourceChunkId: chunk.id
      };
    }

    if (text.includes('Dynamic Programming') || text.includes('Memoization')) {
      return {
        id: `q-${chunk.id}-${index}`,
        question: 'What are the two foundational prerequisites required for a problem to be solvable via Dynamic Programming?',
        type: 'mcq',
        options: [
          'Linear time complexity and binary trees',
          'Optimal Substructure and Overlapping Subproblems',
          'Deterministic finite automata and greedy sorting',
          'NP-completeness and exponential space'
        ],
        correctAnswerIndex: 1,
        explanation: 'Dynamic Programming requires both Optimal Substructure (optimal solution contains optimal sub-solutions) and Overlapping Subproblems (the same subproblems are solved repeatedly).',
        hint: 'Review Chapter 5 on Dynamic Programming foundations.',
        relatedTopic: 'Dynamic Programming & Memoization',
        sourceChunkId: chunk.id
      };
    }

    if (text.includes('Mitochondria') || text.includes('Organelles')) {
      return {
        id: `q-${chunk.id}-${index}`,
        question: 'Which eukaryotic organelle generates the vast majority of cellular ATP via oxidative phosphorylation across its cristae?',
        type: 'mcq',
        options: ['Golgi Apparatus', 'Rough Endoplasmic Reticulum', 'Mitochondria', 'Lysosome'],
        correctAnswerIndex: 2,
        explanation: 'Mitochondria generate cellular ATP via the electron transport chain and oxidative phosphorylation located on their inner folded membranes (cristae).',
        hint: 'Frequently referred to as the cellular powerhouse.',
        relatedTopic: 'Cell Biology & Organelles',
        sourceChunkId: chunk.id
      };
    }

    if (text.includes('Transcription') || text.includes('Central Dogma')) {
      return {
        id: `q-${chunk.id}-${index}`,
        question: 'During eukaryotic transcription, which enzyme synthesizes pre-mRNA from the 3\' to 5\' DNA template strand?',
        type: 'mcq',
        options: ['DNA Ligase', 'RNA Polymerase', 'Aminoacyl-tRNA Synthetase', 'Ribosome Peptidyl Transferase'],
        correctAnswerIndex: 1,
        explanation: 'RNA Polymerase reads the template DNA strand in the 3\' to 5\' direction and synthesizes complementary pre-mRNA in the 5\' to 3\' direction.',
        hint: 'Enzyme responsible for RNA synthesis.',
        relatedTopic: 'Central Dogma & Transcription',
        sourceChunkId: chunk.id
      };
    }

    if (text.includes('Gradient Descent') || text.includes('Adam')) {
      return {
        id: `q-${chunk.id}-${index}`,
        question: 'What role does the learning rate (alpha) play in gradient descent weight updates?',
        type: 'mcq',
        options: [
          'Determines the step size taken in the direction opposite to the gradient of the loss function',
          'Sets the number of hidden layers in the neural network',
          'Eliminates all training variance automatically',
          'Normalizes the softmax logits to sum to 1'
        ],
        correctAnswerIndex: 0,
        explanation: 'The learning rate alpha scales the gradient vector: theta = theta - alpha * grad(J). If too large, optimization diverges; if too small, convergence is painfully slow.',
        hint: 'Think about the step size down the optimization loss surface.',
        relatedTopic: 'Gradient Descent & Optimizers',
        sourceChunkId: chunk.id
      };
    }

    // Default question based on chunk text
    return {
      id: `q-${chunk.id}-${index}`,
      question: `According to "${chunk.chapterTitle || chunk.documentTitle}", which statement is accurate?`,
      type: 'mcq',
      options: [
        `Key concepts in this chapter provide foundational principles for ${chunk.keywords[0] || 'analysis'}.`,
        'All computational algorithms exhibit constant O(1) runtime.',
        'Biological cells lack membrane-bound internal structures.',
        'Optimization requires zero parameter adjustments.'
      ],
      correctAnswerIndex: 0,
      explanation: `Refer to ${chunk.chapterTitle || 'the course material'} for the detailed breakdown of ${chunk.keywords.join(', ')}.`,
      hint: `Review the section discussing ${chunk.keywords[0] || 'the core definitions'}.`,
      relatedTopic: chunk.chapterTitle || 'Course Concepts',
      sourceChunkId: chunk.id
    };
  }

  // Flashcards Builder
  public buildFlashcards(topic: string, count: number = 5): Flashcard[] {
    const cards: Flashcard[] = [];
    const deckId = `deck-${Date.now()}`;
    const retrieved = ragService.searchCourseMaterials(topic, 4);

    if (retrieved.length > 0) {
      retrieved.forEach((r, idx) => {
        const chunk = r.chunk;
        cards.push({
          id: `fc-${chunk.id}-${idx}`,
          deckId,
          front: `What is the core principle of ${chunk.chapterTitle || topic}?`,
          back: chunk.content.slice(0, 180) + '...',
          hint: `Key terms: ${chunk.keywords.slice(0, 3).join(', ')}`,
          topic: chunk.chapterTitle || topic,
          sourceRef: `${chunk.documentTitle} (Chunk ${chunk.chunkIndex})`,
          box: 1,
          intervalDays: 1,
          nextReviewDate: new Date().toISOString(),
          repetitions: 0,
          easeFactor: 2.5
        });
      });
    }

    if (cards.length === 0) {
      cards.push(
        {
          id: `fc-gen-1`,
          deckId,
          front: `Define Asymptotic Worst-Case (Big-O)`,
          back: `A mathematical upper bound on the growth rate of runtime or space as input size n approaches infinity: f(n) is in O(g(n)).`,
          hint: 'Guarantees the algorithm will not take longer than c * g(n).',
          topic: 'Complexity Analysis',
          box: 1,
          intervalDays: 1,
          nextReviewDate: new Date().toISOString(),
          repetitions: 0,
          easeFactor: 2.5
        },
        {
          id: `fc-gen-2`,
          deckId,
          front: `What are Overlapping Subproblems in DP?`,
          back: `When a recursive algorithm re-solves the exact same subproblems repeatedly, making memoization or tabulation highly efficient.`,
          hint: 'Compare fib(5) calculating fib(3) multiple times.',
          topic: 'Dynamic Programming',
          box: 1,
          intervalDays: 1,
          nextReviewDate: new Date().toISOString(),
          repetitions: 0,
          easeFactor: 2.5
        },
        {
          id: `fc-gen-3`,
          deckId,
          front: `L1 vs L2 Regularization Differences`,
          back: `L1 (Lasso) adds absolute weights penalty lambda*|w| and produces sparse models with zero weights. L2 (Ridge) adds squared penalty lambda*w^2 and shrinks weights toward zero without setting them to exact zero.`,
          hint: 'Lasso does automatic feature selection.',
          topic: 'Machine Learning',
          box: 1,
          intervalDays: 1,
          nextReviewDate: new Date().toISOString(),
          repetitions: 0,
          easeFactor: 2.5
        }
      );
    }

    return cards.slice(0, count);
  }

  // Concept Explainer Builder
  public buildConceptExplanation(concept: string, level: string, style: string) {
    return {
      concept,
      level,
      style,
      summary: `A complete mental model for "${concept}" explained through the Feynman technique.`,
      intuition: `Imagine you have a complex task that can be simplified into repeatable steps. In ${concept}, rather than guessing or brute-forcing every option, we leverage systematic invariants.`,
      formalDefinition: `In formal terms, ${concept} represents an algorithmic, biological, or mathematical structure governed by well-defined operational rules.`,
      analogy: `Analogy: Think of ${concept} like organizing books in a library. Instead of throwing every book on one giant floor (requiring you to search book by book), you categorize them by genre and alphabetical index, reducing search time from hours to seconds!`,
      commonMistakes: [
        'Assuming faster average runtime translates to faster execution for tiny trivial inputs.',
        'Overlooking edge cases such as empty sets, null references, or boundary limits.',
        'Confusing time complexity efficiency with memory space consumption.'
      ],
      selfCheckQuestions: [
        `Can you explain how ${concept} behaves when the input size doubles?`,
        `What is the primary tradeoff being made when choosing ${concept}?`
      ]
    };
  }
}

export const toolsService = new ToolsService();
