import React, { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  FileUp, 
  Layers, 
  Plus, 
  RotateCcw, 
  Search, 
  Sparkles, 
  Tag, 
  Trash2 
} from 'lucide-react';
import type { CourseDocument, DocumentChunk, RetrievalResult } from '../types';
import { ragService } from '../services/ragService';

interface CourseMaterialsProps {
  documents: CourseDocument[];
  onRefreshDocs: () => void;
  onAskAboutDoc: (title: string) => void;
}

export const CourseMaterials: React.FC<CourseMaterialsProps> = ({
  documents,
  onRefreshDocs,
  onAskAboutDoc
}) => {
  const [selectedDoc, setSelectedDoc] = useState<CourseDocument | null>(documents[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RetrievalResult[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New Document Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'computer_science' | 'biology' | 'machine_learning' | 'general'>('general');
  const [newContent, setNewContent] = useState('');
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  const chunks = selectedDoc ? ragService.getChunksForDocument(selectedDoc.id) : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const res = ragService.searchCourseMaterials(searchQuery, 4, selectedDoc?.id);
    setSearchResults(res);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingUpload(true);
    try {
      const text = await file.text();
      const docTitle = file.name.replace(/\.[^/.]+$/, '');
      await ragService.addDocument(docTitle, text, newCategory, file.name);
      onRefreshDocs();
      setShowUploadModal(false);
      setNewTitle('');
      setNewContent('');
    } catch (err) {
      console.error('File reading failed', err);
      alert('Could not parse the uploaded file.');
    } finally {
      setIsProcessingUpload(false);
    }
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsProcessingUpload(true);
    try {
      await ragService.addDocument(newTitle, newContent, newCategory, `${newTitle.toLowerCase().replace(/\s+/g, '_')}.txt`);
      onRefreshDocs();
      setShowUploadModal(false);
      setNewTitle('');
      setNewContent('');
    } finally {
      setIsProcessingUpload(false);
    }
  };

  const handleDelete = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this course material and its vector chunks?')) {
      ragService.deleteDocument(docId);
      onRefreshDocs();
      if (selectedDoc?.id === docId) {
        setSelectedDoc(null);
      }
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Reset course library to default sample textbooks?')) {
      ragService.resetToSamples();
      onRefreshDocs();
      setSelectedDoc(ragService.getDocuments()[0] || null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Course Materials &amp; RAG Vector Store</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {documents.length} Documents &bull; {ragService.getAllChunks().length} Chunks
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Documents uploaded here are automatically chunked, keyword-extracted, and indexed for semantic Q&amp;A and quiz generation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Reload pre-loaded sample textbooks"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Samples</span>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Course Material</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Document List on left, Chunk Viewer on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Documents List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 px-1 flex items-center justify-between">
            <span>Uploaded Course Materials</span>
            <span className="text-xs text-slate-500">{documents.length} available</span>
          </h3>

          <div className="space-y-2.5">
            {documents.map(doc => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoc(doc);
                    setSearchResults([]);
                  }}
                  className={`p-4 rounded-xl border transition cursor-pointer relative group ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-950/50'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition">
                          {doc.title}
                        </h4>
                        <span className="text-[11px] text-slate-400 capitalize">{doc.category.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDelete(doc.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                      title="Delete material"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {doc.description}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 text-indigo-400">
                      <Layers className="w-3.5 h-3.5" />
                      {doc.chunkCount} Chunks Indexed
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAskAboutDoc(doc.title);
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      Ask AI &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chunk Viewer & Live Search */}
        <div className="lg:col-span-7 space-y-4">
          {selectedDoc ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5">
              {/* Document Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Inspecting Chunks
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedDoc.title}</h3>
                  <p className="text-xs text-slate-400">{selectedDoc.filename}</p>
                </div>

                <button
                  onClick={() => onAskAboutDoc(selectedDoc.title)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold self-start sm:self-auto shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI Tutor</span>
                </button>
              </div>

              {/* Live Vector Search inside Document */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Test RAG retrieval: enter keywords or question (e.g. Asymptotic analysis)..."
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="text-xs text-slate-500 hover:text-white absolute right-3 top-2.5"
                  >
                    Clear
                  </button>
                )}
              </form>

              {/* Search Results Display if active */}
              {searchResults.length > 0 && (
                <div className="space-y-3 p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40">
                  <div className="text-xs font-semibold text-indigo-300 flex items-center justify-between">
                    <span>Top RAG Matches for "{searchQuery}"</span>
                    <span>{searchResults.length} excerpts retrieved</span>
                  </div>
                  <div className="space-y-2">
                    {searchResults.map((res, rIdx) => (
                      <div key={rIdx} className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-xs">
                        <div className="flex items-center justify-between text-slate-400 mb-1">
                          <span className="font-semibold text-indigo-300">
                            {res.chunk.chapterTitle || `Chunk ${res.chunk.chunkIndex}`}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            {Math.round(res.score * 100)}% Confidence
                          </span>
                        </div>
                        <p className="text-slate-200 line-clamp-3 leading-relaxed">{res.chunk.content}</p>
                        {res.matchedKeywords.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {res.matchedKeywords.map((k, kIdx) => (
                              <span key={kIdx} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-amber-300">
                                #{k}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chunks List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
                  <span>Indexed Chunks ({chunks.length})</span>
                  <span>Average ~180 words/chunk with overlap</span>
                </div>

                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {chunks.map(chunk => (
                    <div
                      key={chunk.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-400">
                          {chunk.chapterTitle || `Chunk #${chunk.chunkIndex}`}
                        </span>
                        <span className="text-[11px] text-slate-500">{chunk.wordCount} words</span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {chunk.content}
                      </p>

                      {chunk.keywords && chunk.keywords.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-1 border-t border-slate-900">
                          {chunk.keywords.map((kw, i) => (
                            <span
                              key={i}
                              className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800"
                            >
                              <Tag className="w-2.5 h-2.5 text-indigo-400" />
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center p-8 bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-center">
              <BookOpen className="w-10 h-10 mb-2 text-slate-600" />
              <p className="text-sm">Select a course material from the left to inspect its RAG vector chunks.</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileUp className="w-5 h-5 text-indigo-400" />
                Add Course Notes or Syllabus
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Drag and drop file section */}
            <div className="mb-4 p-4 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/60 text-center">
              <input
                type="file"
                id="file-upload"
                accept=".txt,.md,.markdown,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <FileText className="w-8 h-8 text-indigo-400 mb-2" />
                <span className="text-xs font-semibold text-slate-200">Click to upload file (.txt, .md)</span>
                <span className="text-[11px] text-slate-500 mt-0.5">Chunks will be automatically indexed</span>
              </label>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-900 px-2 text-slate-500">Or Paste Text Notes</span></div>
            </div>

            <form onSubmit={handlePasteSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Document Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g., Operating Systems Lecture 4"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Subject Domain</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="computer_science">Computer Science</option>
                  <option value="biology">Biology</option>
                  <option value="machine_learning">Machine Learning</option>
                  <option value="general">General Science / Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Course Content (Markdown or Text)</label>
                <textarea
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="Paste lecture notes, textbook chapters, or exam study sheets..."
                  rows={5}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingUpload || !newTitle.trim() || !newContent.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold"
                >
                  {isProcessingUpload ? 'Indexing Chunks...' : 'Ingest & Index'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
