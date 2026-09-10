# 🎓 AI Learning & Study Assistant

> **Creates learning plans, answers questions from course materials and generates quizzes**  
> **Architecture: RAG + Memory + Tools**

---

## 🚀 Quick Start

The app runs in development mode at `http://localhost:5173/`.

To run locally:
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🌟 Core Pillars

### 1. 📅 Creates Learning Plans
- **Dynamic Roadmaps**: Generates customizable study schedules based on exam date, daily available hours, and topic difficulty.
- **Weak Spots Injection**: Automatically pulls struggling topics from your Learner Memory to prioritize high-impact revision.
- **Interactive Checklists**: Check off daily milestone tasks, track completion percentages, and record study minutes into your cognitive log.

### 2. 📚 Answers Questions from Course Materials (RAG Engine)
- **Pre-Loaded Course Libraries**: Ready-to-study textbooks in *Data Structures & Algorithms*, *Cell Biology & Molecular Genetics*, and *Machine Learning*.
- **Custom Ingestion**: Upload `.txt`, `.md`, or paste custom notes. Automatically chunked with overlap and keyword extraction.
- **Grounded Citations**: The AI Assistant provides answers citing exact documents and chapters with confidence scores and excerpt popovers.

### 3. 📝 Generates Quizzes & Flashcards
- **Interactive Assessments**: Multiple Choice, True/False, and Conceptual questions directly drawn from indexed course chunks.
- **Instant Explanations & Scoring**: Immediate feedback on option selection and celebratory confetti on high scores.
- **Automatic Knowledge Graph Sync**: Quiz results update the learner's topic mastery and flag misconceptions for targeted remediation.
- **Leitner Spaced Repetition**: 3D flipping flashcards with 5-box spaced repetition intervals (Again, Hard, Good, Easy).

---

## 🛠️ Transparent Agentic Architecture

- **RAG Engine**: In-memory & LocalStorage hybrid vector store (TF-IDF + Cosine similarity).
- **Memory System**: Student profile, topic mastery graph (`Mastered`, `Learning`, `Struggling`), misconceptions tracker, and study streak calculator.
- **Tools Suite**: Executable tools (`tool_search_course_material`, `tool_generate_study_plan`, `tool_generate_quiz`, `tool_generate_flashcards`, `tool_explain_concept`, `tool_update_mastery`, `tool_analyze_progress`).
- **Visible Tool Inspector**: Chat UI reveals real-time agent tool executions, inputs, and reasoning traces.

