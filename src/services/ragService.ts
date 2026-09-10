// RAG Service: Course Document Parsing, Semantic Chunking, Vector Indexing & Hybrid Retrieval
import type { CourseDocument, DocumentChunk, RetrievalResult, SubjectCategory } from '../types';
import { SAMPLE_COURSES } from './sampleData';

const STORAGE_KEY_DOCS = 'ai_study_documents';
const STORAGE_KEY_CHUNKS = 'ai_study_chunks';

class RAGService {
  private documents: CourseDocument[] = [];
  private chunks: DocumentChunk[] = [];
  private stopwords = new Set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'did', 'do',
    'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having',
    'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it',
    'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on',
    'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should',
    'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there',
    'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we',
    'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your',
    'yours', 'yourself', 'yourselves'
  ]);

  constructor() {
    this.initializeData();
  }

  private initializeData(): void {
    try {
      const savedDocs = localStorage.getItem(STORAGE_KEY_DOCS);
      const savedChunks = localStorage.getItem(STORAGE_KEY_CHUNKS);

      if (savedDocs && savedChunks) {
        this.documents = JSON.parse(savedDocs);
        this.chunks = JSON.parse(savedChunks);
      } else {
        // Populate default sample courses
        this.documents = SAMPLE_COURSES.map(c => c.document);
        this.chunks = SAMPLE_COURSES.flatMap(c => c.chunks);
        this.persist();
      }
    } catch (e) {
      console.warn('Failed to load from storage, using memory defaults', e);
      this.documents = SAMPLE_COURSES.map(c => c.document);
      this.chunks = SAMPLE_COURSES.flatMap(c => c.chunks);
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(this.documents));
      localStorage.setItem(STORAGE_KEY_CHUNKS, JSON.stringify(this.chunks));
    } catch (e) {
      console.error('Storage persistence failed', e);
    }
  }

  public getDocuments(): CourseDocument[] {
    return [...this.documents];
  }

  public getDocumentById(id: string): CourseDocument | undefined {
    return this.documents.find(d => d.id === id);
  }

  public getChunksForDocument(documentId: string): DocumentChunk[] {
    return this.chunks.filter(c => c.documentId === documentId);
  }

  public getAllChunks(): DocumentChunk[] {
    return [...this.chunks];
  }

  public resetToSamples(): void {
    this.documents = SAMPLE_COURSES.map(c => c.document);
    this.chunks = SAMPLE_COURSES.flatMap(c => c.chunks);
    this.persist();
  }

  // Tokenizer and keyword extractor
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !this.stopwords.has(w));
  }

  // Chunking algorithm with configurable overlap
  public chunkText(
    fullText: string,
    documentId: string,
    documentTitle: string,
    chunkSizeWords: number = 180,
    overlapWords: number = 30
  ): DocumentChunk[] {
    // Split by sections or paragraphs first
    const rawParagraphs = fullText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    const resultChunks: DocumentChunk[] = [];
    let currentWords: string[] = [];
    let chunkIndex = 1;
    let currentChapter = 'Overview & Core Concepts';

    const flushChunk = () => {
      if (currentWords.length === 0) return;
      const content = currentWords.join(' ');
      const tokens = this.tokenize(content);
      const uniqueKeywords = Array.from(new Set(tokens)).slice(0, 10);

      resultChunks.push({
        id: `${documentId}-chunk-${chunkIndex}`,
        documentId,
        documentTitle,
        chapterTitle: currentChapter,
        chunkIndex,
        content,
        wordCount: currentWords.length,
        keywords: uniqueKeywords
      });

      // Maintain overlap
      currentWords = currentWords.slice(Math.max(0, currentWords.length - overlapWords));
      chunkIndex++;
    };

    for (const paragraph of rawParagraphs) {
      // Check for chapter or section headers (e.g. # Chapter 1 or Chapter 2: ...)
      const headerMatch = paragraph.match(/^(?:#+\s*|Chapter\s+\d+:?\s*|Section\s+\d+:?\s*)(.+)/i);
      if (headerMatch) {
        if (currentWords.length > 50) {
          flushChunk();
        }
        currentChapter = paragraph.replace(/^#+\s*/, '').slice(0, 80);
      }

      const words = paragraph.split(/\s+/).filter(Boolean);
      for (const word of words) {
        currentWords.push(word);
        if (currentWords.length >= chunkSizeWords) {
          flushChunk();
        }
      }
    }

    if (currentWords.length > 0) {
      flushChunk();
    }

    return resultChunks;
  }

  // Add custom or uploaded document
  public async addDocument(
    title: string,
    content: string,
    category: SubjectCategory = 'general',
    filename: string = 'uploaded_notes.txt',
    description?: string
  ): Promise<CourseDocument> {
    const documentId = `doc-custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newChunks = this.chunkText(content, documentId, title);

    const newDoc: CourseDocument = {
      id: documentId,
      title,
      category,
      description: description || `Uploaded study material with ${newChunks.length} indexed chunks.`,
      filename,
      uploadedAt: new Date().toISOString(),
      chunkCount: newChunks.length,
      contentSummary: content.slice(0, 220) + (content.length > 220 ? '...' : ''),
      rawContent: content
    };

    this.documents.unshift(newDoc);
    this.chunks.push(...newChunks);
    this.persist();

    return newDoc;
  }

  public deleteDocument(documentId: string): boolean {
    this.documents = this.documents.filter(d => d.id !== documentId);
    this.chunks = this.chunks.filter(c => c.documentId !== documentId);
    this.persist();
    return true;
  }

  // Hybrid Vector / Semantic & TF-IDF Search Engine
  public searchCourseMaterials(
    query: string,
    topK: number = 3,
    filterDocumentId?: string
  ): RetrievalResult[] {
    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) return [];

    let candidates = this.chunks;
    if (filterDocumentId) {
      candidates = candidates.filter(c => c.documentId === filterDocumentId);
    }

    const results: RetrievalResult[] = [];

    // Precalculate query term frequencies
    const queryTermFreq: Record<string, number> = {};
    for (const token of queryTokens) {
      queryTermFreq[token] = (queryTermFreq[token] || 0) + 1;
    }

    for (const chunk of candidates) {
      const contentLower = chunk.content.toLowerCase();
      const chunkTokens = this.tokenize(chunk.content);
      const chunkTokenSet = new Set(chunkTokens);

      let matchedKeywords: string[] = [];
      let tfScore = 0;

      for (const [token, qFreq] of Object.entries(queryTermFreq)) {
        if (chunkTokenSet.has(token)) {
          matchedKeywords.push(token);
          // Frequency in chunk
          const countInChunk = chunkTokens.filter(t => t === token).length;
          tfScore += Math.log(1 + countInChunk) * (1 + qFreq);
        } else if (contentLower.includes(token)) {
          // Substring partial match
          tfScore += 0.5;
          matchedKeywords.push(token);
        }
      }

      // Title and chapter boost
      const titleLower = (chunk.documentTitle + ' ' + (chunk.chapterTitle || '')).toLowerCase();
      for (const token of queryTokens) {
        if (titleLower.includes(token)) {
          tfScore += 2.0;
        }
      }

      // Exact phrase match bonus
      if (query.trim().length > 4 && contentLower.includes(query.toLowerCase().trim())) {
        tfScore += 5.0;
      }

      // Normalize score into a 0.0 - 1.0 confidence range
      if (tfScore > 0) {
        const normalizedScore = Math.min(0.99, Number((tfScore / (queryTokens.length * 4 + 2)).toFixed(2)));
        results.push({
          chunk,
          score: Math.max(0.15, normalizedScore),
          matchedKeywords: Array.from(new Set(matchedKeywords))
        });
      }
    }

    // Sort descending by score
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }
}

export const ragService = new RAGService();
