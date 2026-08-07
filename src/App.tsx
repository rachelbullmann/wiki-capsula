import React, { useState, useEffect, useMemo } from 'react';
import { Note, ViewMode } from './types';
import { INITIAL_NOTES } from './initialNotes';
import {
  buildGraphData,
  getBacklinks,
  slugify,
} from './utils/noteUtils';
import { downloadSingleNoteMarkdown, downloadAllNotesZip } from './utils/exportUtils';
import { Sidebar } from './components/Sidebar';
import { NoteViewer } from './components/NoteViewer';
import { NoteEditor } from './components/NoteEditor';
import { GraphView } from './components/GraphView';
import { ImportModal } from './components/ImportModal';
import { GlobalManagerView } from './components/GlobalManagerView';
import {
  BookOpen,
  Network,
  Plus,
  Upload,
  Download,
  Share2,
  Menu,
  X,
  Layers,
  Sparkles,
  Info,
  Radio,
  Target,
  SlidersHorizontal,
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'wiki_notes_data_v2';

const cleanAndDeduplicateTags = (rawTags: string[]): string[] => {
  if (!Array.isArray(rawTags)) return [];
  const result: string[] = [];
  for (const tag of rawTags) {
    if (typeof tag !== 'string') continue;
    const cleaned = tag.replace(/^#+/, '').trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (cleaned && !result.includes(cleaned)) {
      result.push(cleaned);
    }
  }
  return result;
};

const sanitizeNotesList = (list: Note[]): Note[] => {
  return list.map((note) => ({
    ...note,
    tags: cleanAndDeduplicateTags(note.tags || []),
  }));
};

export default function App() {
  // Persistence state
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return sanitizeNotesList(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to load notes from localStorage:', err);
    }
    return sanitizeNotesList(INITIAL_NOTES);
  });

  // Selected note ID
  const [selectedNoteId, setSelectedNoteId] = useState<string>(() => {
    return notes[0]?.id || '';
  });

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // View state: 'read' | 'edit' | 'graph'
  const [viewMode, setViewMode] = useState<ViewMode>('read');

  // Editor creation context (for creating concept notes directly)
  const [creatingConceptTitle, setCreatingConceptTitle] = useState<string>('');

  // Import modal
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Mobile sidebar toggle
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Save notes to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
  }, [notes]);

  // Derived lists
  const categories = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => {
      if (n.category) set.add(n.category);
    });
    return Array.from(set).sort();
  }, [notes]);

  const tags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => {
      n.tags.forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [notes]);

  // Selected Note Object
  const selectedNote = useMemo(() => {
    return notes.find((n) => n.id === selectedNoteId) || notes[0] || null;
  }, [notes, selectedNoteId]);

  // Backlinks for selected note
  const backlinks = useMemo(() => {
    if (!selectedNote) return [];
    return getBacklinks(notes, selectedNote.title, selectedNote.id);
  }, [notes, selectedNote]);

  // Graph Data (Nodes & Links)
  const graphData = useMemo(() => {
    return buildGraphData(notes);
  }, [notes]);

  // Navigation handlers
  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    if (viewMode === 'edit') {
      setViewMode('read');
    }
    setIsMobileSidebarOpen(false);
  };

  const handleStartCreateNew = () => {
    setCreatingConceptTitle('');
    setSelectedNoteId('');
    setViewMode('edit');
    setIsMobileSidebarOpen(false);
  };

  const handleCreateConceptNote = (conceptTitle: string) => {
    // Check if note already exists
    const existing = notes.find((n) => n.title.toLowerCase() === conceptTitle.toLowerCase());
    if (existing) {
      setSelectedNoteId(existing.id);
      setViewMode('read');
    } else {
      setCreatingConceptTitle(conceptTitle);
      setSelectedNoteId('');
      setViewMode('edit');
    }
  };

  const handleSaveNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();

    if (selectedNoteId) {
      // Editing existing
      setNotes((prev) =>
        prev.map((n) =>
          n.id === selectedNoteId
            ? {
                ...n,
                ...noteData,
                updatedAt: now,
              }
            : n
        )
      );
    } else {
      // Creating new
      const newId = slugify(noteData.title);
      const newNote: Note = {
        ...noteData,
        id: newId,
        createdAt: now,
        updatedAt: now,
      };
      setNotes((prev) => [newNote, ...prev]);
      setSelectedNoteId(newId);
    }

    setViewMode('read');
  };

  const handleDeleteNote = () => {
    if (!selectedNote) return;
    if (window.confirm(`Tem certeza que deseja excluir a nota "${selectedNote.title}"?`)) {
      const remaining = notes.filter((n) => n.id !== selectedNote.id);
      setNotes(remaining);
      if (remaining.length > 0) {
        setSelectedNoteId(remaining[0].id);
      } else {
        setSelectedNoteId('');
      }
      setViewMode('read');
    }
  };

  const handleImportNotes = (importedNotes: Note[]) => {
    setNotes((prev) => {
      // Filter out duplicates by title
      const existingTitles = new Set(prev.map((n) => n.title.toLowerCase()));
      const filteredImported = importedNotes.filter(
        (n) => !existingTitles.has(n.title.toLowerCase())
      );
      return [...filteredImported, ...prev];
    });

    if (importedNotes.length > 0) {
      setSelectedNoteId(importedNotes[0].id);
      setViewMode('read');
    }
  };

  const handleResetToInitial = () => {
    if (window.confirm('Deseja restaurar a Wiki para as anotações padrão iniciais? Suas alterações salvas locais serão mantidas como backup se exportadas.')) {
      setNotes(INITIAL_NOTES);
      setSelectedNoteId(INITIAL_NOTES[0].id);
      setViewMode('read');
    }
  };

  const handleUpdateNoteContent = (noteId: string, updatedContent: string) => {
    const now = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId
          ? {
              ...n,
              content: updatedContent,
              updatedAt: now,
            }
          : n
      )
    );
  };

  // Global management handlers
  const handleUpdateCategoryName = (oldCategory: string, newCategory: string) => {
    const now = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) =>
        n.category === oldCategory ? { ...n, category: newCategory, updatedAt: now } : n
      )
    );
  };

  const handleDeleteCategory = (categoryToDelete: string, targetCategory: string = 'Geral') => {
    const now = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) =>
        n.category === categoryToDelete ? { ...n, category: targetCategory, updatedAt: now } : n
      )
    );
  };

  const handleRenameTag = (oldTag: string, newTag: string) => {
    const now = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) => {
        if (n.tags.includes(oldTag)) {
          const updated = Array.from(new Set(n.tags.map((t) => (t === oldTag ? newTag : t))));
          return { ...n, tags: updated, updatedAt: now };
        }
        return n;
      })
    );
  };

  const handleDeleteTag = (tagToDelete: string) => {
    const now = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) => {
        if (n.tags.includes(tagToDelete)) {
          return {
            ...n,
            tags: n.tags.filter((t) => t !== tagToDelete),
            updatedAt: now,
          };
        }
        return n;
      })
    );
  };

  const handleMergeTags = (tagsToMerge: string[], targetTag: string) => {
    const now = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) => {
        const hasAny = n.tags.some((t) => tagsToMerge.includes(t));
        if (hasAny) {
          const filtered = n.tags.filter((t) => !tagsToMerge.includes(t));
          if (!filtered.includes(targetTag)) filtered.push(targetTag);
          return { ...n, tags: filtered, updatedAt: now };
        }
        return n;
      })
    );
  };

  const handleBatchUpdateNotesCategory = (noteIds: string[], newCategory: string) => {
    const now = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) => (noteIds.includes(n.id) ? { ...n, category: newCategory, updatedAt: now } : n))
    );
  };

  const handleBatchAddTagsToNotes = (noteIds: string[], tagsToAdd: string[]) => {
    const now = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) => {
        if (noteIds.includes(n.id)) {
          const set = new Set([...n.tags, ...tagsToAdd]);
          return { ...n, tags: Array.from(set), updatedAt: now };
        }
        return n;
      })
    );
  };

  const handleBatchRemoveTagsFromNotes = (noteIds: string[], tagsToRemove: string[]) => {
    const now = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) => {
        if (noteIds.includes(n.id)) {
          return {
            ...n,
            tags: n.tags.filter((t) => !tagsToRemove.includes(t)),
            updatedAt: now,
          };
        }
        return n;
      })
    );
  };

  const handleBatchDeleteNotes = (noteIds: string[]) => {
    setNotes((prev) => prev.filter((n) => !noteIds.includes(n.id)));
  };

  const handleUpdateNoteTitle = (noteId: string, newTitle: string) => {
    const now = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, title: newTitle, updatedAt: now } : n))
    );
  };

  const handleUpdateNoteCategory = (noteId: string, newCategory: string) => {
    const now = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, category: newCategory, updatedAt: now } : n))
    );
  };

  const handleUpdateNoteTags = (noteId: string, newTags: string[]) => {
    const now = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, tags: newTags, updatedAt: now } : n))
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 font-sans text-slate-900 overflow-hidden">
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="lg:hidden p-1.5 text-slate-300 hover:bg-slate-800 rounded-lg transition"
            aria-label="Abrir Menu"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 flex items-center justify-center font-bold text-white shadow-md border border-emerald-400/40 relative group">
              <Radio className="w-5 h-5 text-emerald-100 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold font-serif leading-none tracking-tight text-white flex items-center gap-1.5">
                  Radar do Dragão
                </h1>
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                  CAPSULE CORP.
                </span>
              </div>
              <span className="text-[11px] text-slate-300 font-mono flex items-center gap-1">
                <Target className="w-3 h-3 text-emerald-400 inline" />
                Mapeamento de Conceitos & Grafo de Conhecimento
              </span>
            </div>
          </div>
        </div>

        {/* View Mode Switcher Header Bar */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700/80 text-xs font-medium text-slate-300">
            <button
              onClick={() => setViewMode('read')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition cursor-pointer ${
                viewMode === 'read'
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Página Wiki</span>
            </button>

            <button
              onClick={() => setViewMode('graph')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition cursor-pointer ${
                viewMode === 'graph'
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Grafo de Conceitos</span>
            </button>

            <button
              onClick={() => setViewMode('manage')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition cursor-pointer ${
                viewMode === 'manage'
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-300" />
              <span>Gerenciador Global</span>
            </button>
          </div>

          <button
            onClick={() => setIsImportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
            title="Importar anotações de arquivo ou texto"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Importar Texto</span>
          </button>

          <button
            onClick={handleStartCreateNew}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nova Nota</span>
          </button>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden p-3 gap-4 relative">
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-slate-900/60 z-30 backdrop-blur-sm"
          />
        )}

        {/* Sidebar Container */}
        <aside
          className={`lg:static fixed inset-y-0 left-0 z-40 w-80 p-3 lg:p-0 transition-transform duration-300 ease-in-out ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <Sidebar
            notes={notes}
            selectedNoteId={selectedNoteId}
            categories={categories}
            tags={tags}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
            onSelectNote={handleSelectNote}
            onCreateNew={handleStartCreateNew}
            onExportAll={() => downloadAllNotesZip(notes)}
            onOpenGlobalManager={() => {
              setViewMode('manage');
              setIsMobileSidebarOpen(false);
            }}
          />
        </aside>

        {/* Main Workspace Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-200/50 rounded-xl p-1">
          {/* Mobile View Switcher Tabs */}
          <div className="sm:hidden flex items-center justify-center gap-2 mb-2 p-1 bg-slate-300/60 rounded-lg text-xs font-medium">
            <button
              onClick={() => setViewMode('read')}
              className={`flex-1 py-1.5 rounded transition ${
                viewMode === 'read' ? 'bg-white font-bold text-slate-800 shadow' : 'text-slate-600'
              }`}
            >
              Wiki
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`flex-1 py-1.5 rounded transition ${
                viewMode === 'graph' ? 'bg-white font-bold text-slate-800 shadow' : 'text-slate-600'
              }`}
            >
              Grafo
            </button>
            <button
              onClick={() => setViewMode('manage')}
              className={`flex-1 py-1.5 rounded transition ${
                viewMode === 'manage' ? 'bg-white font-bold text-slate-800 shadow' : 'text-slate-600'
              }`}
            >
              Gerenciar
            </button>
          </div>

          {/* Render Active View */}
          {viewMode === 'manage' ? (
            <GlobalManagerView
              notes={notes}
              categories={categories}
              tags={tags}
              onUpdateCategoryName={handleUpdateCategoryName}
              onDeleteCategory={handleDeleteCategory}
              onRenameTag={handleRenameTag}
              onDeleteTag={handleDeleteTag}
              onMergeTags={handleMergeTags}
              onBatchUpdateNotesCategory={handleBatchUpdateNotesCategory}
              onBatchAddTagsToNotes={handleBatchAddTagsToNotes}
              onBatchRemoveTagsFromNotes={handleBatchRemoveTagsFromNotes}
              onBatchDeleteNotes={handleBatchDeleteNotes}
              onUpdateNoteTitle={handleUpdateNoteTitle}
              onUpdateNoteCategory={handleUpdateNoteCategory}
              onUpdateNoteTags={handleUpdateNoteTags}
              onNavigateToNote={handleSelectNote}
              onClose={() => setViewMode('read')}
            />
          ) : viewMode === 'edit' ? (
            <NoteEditor
              note={selectedNoteId ? selectedNote : null}
              initialTitle={creatingConceptTitle}
              onSave={handleSaveNote}
              onCancel={() => setViewMode('read')}
              allNoteTitles={notes.map((n) => n.title)}
            />
          ) : viewMode === 'graph' ? (
            <div className="flex flex-col h-full space-y-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-800 font-serif">
                    Mapa de Conexões e Conceitos
                  </span>
                  <span className="text-slate-400 hidden md:inline">|</span>
                  <span className="text-slate-500 hidden md:inline">
                    Exibindo {graphData.nodes.length} nós e {graphData.links.length} conexões detectadas via [[vínculos]].
                  </span>
                </div>
                <button
                  onClick={() => setViewMode('read')}
                  className="text-xs font-medium text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200"
                >
                  Voltar para Nota
                </button>
              </div>

              <div className="flex-1 min-h-0">
                <GraphView
                  nodes={graphData.nodes}
                  links={graphData.links}
                  selectedNoteId={selectedNoteId}
                  onSelectNode={(nodeId, nodeTitle, isConcept) => {
                    if (isConcept) {
                      handleCreateConceptNote(nodeTitle);
                    } else {
                      handleSelectNote(nodeId);
                      setViewMode('read');
                    }
                  }}
                />
              </div>
            </div>
          ) : selectedNote ? (
            <NoteViewer
              note={selectedNote}
              backlinks={backlinks}
              allNotes={notes}
              onEdit={() => setViewMode('edit')}
              onDelete={handleDeleteNote}
              onNavigateToNote={handleSelectNote}
              onCreateConceptNote={handleCreateConceptNote}
              onExportNote={downloadSingleNoteMarkdown}
              onSelectTag={(tag) => setSelectedTag(tag)}
              onUpdateNoteContent={handleUpdateNoteContent}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white rounded-xl border border-slate-200">
              <BookOpen className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-lg font-bold text-slate-700 font-serif mb-1">
                Nenhuma Nota Selecionada
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                Selecione uma nota na lista lateral ou crie uma nova para organizar seus conceitos.
              </p>
              <button
                onClick={handleStartCreateNew}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg shadow transition"
              >
                + Criar Nova Anotação
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportNotes={handleImportNotes}
      />
    </div>
  );
}
