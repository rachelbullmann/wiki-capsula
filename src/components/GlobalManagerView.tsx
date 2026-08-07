import React, { useState } from 'react';
import { Note } from '../types';
import {
  Folder,
  Tag,
  FileText,
  Edit3,
  Trash2,
  Check,
  Plus,
  FolderPlus,
  Layers,
  ArrowRight,
  Search,
  CheckSquare,
  Square,
  X,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface GlobalManagerViewProps {
  notes: Note[];
  categories: string[];
  tags: string[];
  onUpdateCategoryName: (oldCategory: string, newCategory: string) => void;
  onDeleteCategory: (categoryToDelete: string, targetCategory?: string) => void;
  onRenameTag: (oldTag: string, newTag: string) => void;
  onDeleteTag: (tagToDelete: string) => void;
  onMergeTags: (tagsToMerge: string[], targetTag: string) => void;
  onBatchUpdateNotesCategory: (noteIds: string[], newCategory: string) => void;
  onBatchAddTagsToNotes: (noteIds: string[], tagsToAdd: string[]) => void;
  onBatchRemoveTagsFromNotes: (noteIds: string[], tagsToRemove: string[]) => void;
  onBatchDeleteNotes: (noteIds: string[]) => void;
  onUpdateNoteTitle: (noteId: string, newTitle: string) => void;
  onUpdateNoteCategory: (noteId: string, newCategory: string) => void;
  onUpdateNoteTags: (noteId: string, newTags: string[]) => void;
  onNavigateToNote: (noteId: string) => void;
  onClose: () => void;
}

export const GlobalManagerView: React.FC<GlobalManagerViewProps> = ({
  notes,
  categories,
  tags,
  onUpdateCategoryName,
  onDeleteCategory,
  onRenameTag,
  onDeleteTag,
  onMergeTags,
  onBatchUpdateNotesCategory,
  onBatchAddTagsToNotes,
  onBatchRemoveTagsFromNotes,
  onBatchDeleteNotes,
  onUpdateNoteTitle,
  onUpdateNoteCategory,
  onUpdateNoteTags,
  onNavigateToNote,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'tags' | 'pages'>('categories');

  // Category State
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryNameInput, setNewCategoryNameInput] = useState('');
  const [createCategoryInput, setCreateCategoryInput] = useState('');

  // Tag State
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newTagNameInput, setNewTagNameInput] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [selectedTagsForMerge, setSelectedTagsForMerge] = useState<string[]>([]);
  const [targetMergeTagInput, setTargetMergeTagInput] = useState('');
  const [addTagInputGlobal, setAddTagInputGlobal] = useState('');

  // Pages Batch State
  const [pageSearch, setPageSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterTag, setFilterTag] = useState<string>('ALL');
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);

  // Batch action modals / inputs
  const [batchCategoryInput, setBatchCategoryInput] = useState('');
  const [batchAddTagsInput, setBatchAddTagsInput] = useState('');
  const [batchRemoveTagsInput, setBatchRemoveTagsInput] = useState('');

  // Editing Note Inline State
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteTitleInput, setEditingNoteTitleInput] = useState('');

  // Category counts map
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    notes.forEach((n) => {
      const cat = n.category || 'Geral';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [notes]);

  // Tag counts map
  const tagCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    notes.forEach((n) => {
      n.tags.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return counts;
  }, [notes]);

  // Filtered pages
  const filteredNotes = React.useMemo(() => {
    return notes.filter((n) => {
      if (filterCategory !== 'ALL' && (n.category || 'Geral') !== filterCategory) return false;
      if (filterTag !== 'ALL' && !n.tags.includes(filterTag)) return false;
      if (pageSearch.trim()) {
        const q = pageSearch.toLowerCase();
        return (
          n.title.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q)) ||
          (n.category && n.category.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [notes, filterCategory, filterTag, pageSearch]);

  // Toggle note selection for batch
  const toggleSelectNote = (id: string) => {
    setSelectedNoteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllNotes = () => {
    if (selectedNoteIds.length === filteredNotes.length) {
      setSelectedNoteIds([]);
    } else {
      setSelectedNoteIds(filteredNotes.map((n) => n.id));
    }
  };

  // CATEGORY HANDLERS
  const handleRenameCategorySubmit = (oldCat: string) => {
    if (!newCategoryNameInput.trim() || newCategoryNameInput.trim() === oldCat) {
      setEditingCategory(null);
      return;
    }
    onUpdateCategoryName(oldCat, newCategoryNameInput.trim());
    setEditingCategory(null);
    setNewCategoryNameInput('');
  };

  const handleCreateNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = createCategoryInput.trim();
    if (cleaned && !categories.includes(cleaned)) {
      // Create category by assigning it to a new category placeholder or just trigger update
      setCreateCategoryInput('');
      alert(`Categoria "${cleaned}" criada. Você pode atribuir páginas a ela na aba de Páginas.`);
    }
  };

  // TAG HANDLERS
  const handleRenameTagSubmit = (oldTag: string) => {
    const cleaned = newTagNameInput.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!cleaned || cleaned === oldTag) {
      setEditingTag(null);
      return;
    }
    onRenameTag(oldTag, cleaned);
    setEditingTag(null);
    setNewTagNameInput('');
  };

  const handleToggleTagForMerge = (t: string) => {
    setSelectedTagsForMerge((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  const handleExecuteMergeTags = () => {
    const targetClean = targetMergeTagInput.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (selectedTagsForMerge.length < 2 || !targetClean) {
      alert('Selecione pelo menos 2 tags e especifique o nome da tag de destino!');
      return;
    }
    if (
      window.confirm(
        `Confirmar mesclagem das tags [${selectedTagsForMerge.map((t) => '#' + t).join(', ')}] na tag destino #${targetClean}?`
      )
    ) {
      onMergeTags(selectedTagsForMerge, targetClean);
      setSelectedTagsForMerge([]);
      setTargetMergeTagInput('');
    }
  };

  // BATCH ACTIONS
  const handleApplyBatchCategory = () => {
    if (selectedNoteIds.length === 0) return;
    const cat = batchCategoryInput.trim() || 'Geral';
    onBatchUpdateNotesCategory(selectedNoteIds, cat);
    setBatchCategoryInput('');
    alert(`Categoria "${cat}" aplicada a ${selectedNoteIds.length} página(s)!`);
  };

  const handleApplyBatchAddTags = () => {
    if (selectedNoteIds.length === 0 || !batchAddTagsInput.trim()) return;
    const rawTokens = batchAddTagsInput.split(/[\s,;]+/);
    const parsed = rawTokens
      .map((t) => t.replace(/^#+/, '').trim().toLowerCase().replace(/[^a-z0-9-_]/g, ''))
      .filter(Boolean);

    if (parsed.length > 0) {
      onBatchAddTagsToNotes(selectedNoteIds, parsed);
      setBatchAddTagsInput('');
      alert(`Tag(s) [${parsed.map((t) => '#' + t).join(', ')}] adicionada(s) a ${selectedNoteIds.length} página(s)!`);
    }
  };

  const handleApplyBatchRemoveTags = () => {
    if (selectedNoteIds.length === 0 || !batchRemoveTagsInput.trim()) return;
    const rawTokens = batchRemoveTagsInput.split(/[\s,;]+/);
    const parsed = rawTokens
      .map((t) => t.replace(/^#+/, '').trim().toLowerCase().replace(/[^a-z0-9-_]/g, ''))
      .filter(Boolean);

    if (parsed.length > 0) {
      onBatchRemoveTagsFromNotes(selectedNoteIds, parsed);
      setBatchRemoveTagsInput('');
      alert(`Tag(s) removida(s) de ${selectedNoteIds.length} página(s)!`);
    }
  };

  const handleApplyBatchDelete = () => {
    if (selectedNoteIds.length === 0) return;
    if (
      window.confirm(
        `ATENÇÃO: Deseja realmente excluir permanentemente as ${selectedNoteIds.length} páginas selecionadas?`
      )
    ) {
      onBatchDeleteNotes(selectedNoteIds);
      setSelectedNoteIds([]);
    }
  };

  // INLINE NOTE RENAME
  const handleStartRenameNote = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingNoteTitleInput(note.title);
  };

  const handleSaveRenameNote = (noteId: string) => {
    if (editingNoteTitleInput.trim()) {
      onUpdateNoteTitle(noteId, editingNoteTitleInput.trim());
    }
    setEditingNoteId(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Header Bar */}
      <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 flex items-center justify-center font-bold text-white shadow-lg border border-emerald-400/40">
            <Layers className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-serif tracking-tight">
                Gerenciador Global
              </h2>
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                Capsule Corp.
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Painel de Organização e Edição em Massa para Categorias, Tags e Páginas
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Folder className="w-4 h-4 text-emerald-300" />
            <span>Categorias ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tags')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'tags'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Tag className="w-4 h-4 text-amber-300" />
            <span>Tags ({tags.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pages')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'pages'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-cyan-300" />
            <span>Páginas & Lote ({notes.length})</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
          title="Fechar Gerenciador Global"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* TAB 1: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Top banner */}
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 flex items-start gap-3">
              <FolderPlus className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-white mb-0.5">Gerenciamento de Categorias</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Renomeie categorias globalmente para atualizar todas as notas associadas simultaneamente,
                  ou exclua uma categoria transferindo o conteúdo para outra categoria existente.
                </p>
              </div>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => {
                const count = categoryCounts[cat] || 0;
                const isEditing = editingCategory === cat;

                return (
                  <div
                    key={cat}
                    className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0 border border-slate-700">
                          <Folder className="w-4 h-4" />
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={newCategoryNameInput}
                            onChange={(e) => setNewCategoryNameInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameCategorySubmit(cat);
                              if (e.key === 'Escape') setEditingCategory(null);
                            }}
                            className="bg-slate-900 border border-emerald-500 rounded px-2 py-1 text-xs text-white font-semibold focus:outline-none w-full"
                            autoFocus
                          />
                        ) : (
                          <div className="truncate">
                            <h4 className="text-sm font-bold text-slate-100 truncate">{cat}</h4>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {count} {count === 1 ? 'nota' : 'notas'} vinculada(s)
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleRenameCategorySubmit(cat)}
                              className="p-1.5 text-emerald-400 hover:bg-emerald-950 rounded transition"
                              title="Salvar novo nome"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingCategory(null)}
                              className="p-1.5 text-slate-400 hover:bg-slate-800 rounded transition"
                              title="Cancelar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setNewCategoryNameInput(cat);
                            }}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                            title="Renomear Categoria Globalmente"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Actions bar for category */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <button
                        onClick={() => {
                          const target = prompt(
                            `Excluir categoria "${cat}". Para onde deseja mover as ${count} notas?`,
                            'Geral'
                          );
                          if (target !== null) {
                            onDeleteCategory(cat, target.trim() || 'Geral');
                          }
                        }}
                        className="text-[11px] text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Excluir / Mesclar</span>
                      </button>

                      <button
                        onClick={() => {
                          setFilterCategory(cat);
                          setActiveTab('pages');
                        }}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Ver Notas</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: TAGS */}
        {activeTab === 'tags' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Top Info Banner */}
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 flex items-start gap-3">
              <Tag className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-white mb-0.5">Gerenciador de Tags do Sistema</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Refatore tags duplicadas ou similares. Renomeie tags individualmente, exclua tags obsoletas ou selecione múltiplas tags para mesclá-las em uma única tag unificada.
                </p>
              </div>
            </div>

            {/* Merge Tool Section */}
            <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Ferramenta de Mesclagem de Tags ({selectedTagsForMerge.length} selecionadas)
                </h4>
                {selectedTagsForMerge.length > 0 && (
                  <button
                    onClick={() => setSelectedTagsForMerge([])}
                    className="text-xs text-slate-400 hover:text-white underline"
                  >
                    Limpar Seleção
                  </button>
                )}
              </div>

              {selectedTagsForMerge.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  Clique na caixa de seleção das tags abaixo para selecionar quais deseja mesclar.
                </p>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-2 rounded-lg border border-slate-800">
                    {selectedTagsForMerge.map((t) => (
                      <span
                        key={t}
                        className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono flex items-center gap-1"
                      >
                        #{t}
                        <button
                          onClick={() => handleToggleTagForMerge(t)}
                          className="hover:text-white"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-500 hidden sm:block" />

                  <input
                    type="text"
                    value={targetMergeTagInput}
                    onChange={(e) => setTargetMergeTagInput(e.target.value)}
                    placeholder="Nome da tag destino (ex: #recon)..."
                    className="px-3 py-1.5 text-xs bg-slate-900 border border-amber-500/50 rounded-lg text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />

                  <button
                    onClick={handleExecuteMergeTags}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition cursor-pointer"
                  >
                    Mesclar em Uma Tag
                  </button>
                </div>
              )}
            </div>

            {/* Tag Search filter */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                placeholder="Filtrar lista de tags..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            {/* Tag Grid / List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {tags
                .filter((t) => t.toLowerCase().includes(tagSearch.toLowerCase()))
                .map((t) => {
                  const count = tagCounts[t] || 0;
                  const isSelectedForMerge = selectedTagsForMerge.includes(t);
                  const isEditing = editingTag === t;

                  return (
                    <div
                      key={t}
                      className={`p-3 rounded-xl border transition flex items-center justify-between gap-2 ${
                        isSelectedForMerge
                          ? 'bg-amber-950/40 border-amber-500/80'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleToggleTagForMerge(t)}
                          className="text-slate-400 hover:text-amber-400 transition"
                          title="Selecionar para mesclagem"
                        >
                          {isSelectedForMerge ? (
                            <CheckSquare className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600" />
                          )}
                        </button>

                        {isEditing ? (
                          <input
                            type="text"
                            value={newTagNameInput}
                            onChange={(e) => setNewTagNameInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameTagSubmit(t);
                              if (e.key === 'Escape') setEditingTag(null);
                            }}
                            className="bg-slate-900 border border-amber-500 rounded px-2 py-0.5 text-xs text-amber-300 font-mono w-full focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <div className="truncate">
                            <span className="text-xs font-bold text-amber-300 font-mono block truncate">
                              #{t}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {count} {count === 1 ? 'nota' : 'notas'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleRenameTagSubmit(t)}
                              className="p-1 text-emerald-400 hover:bg-emerald-950 rounded"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingTag(null)}
                              className="p-1 text-slate-400 hover:bg-slate-800 rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingTag(t);
                                setNewTagNameInput(t);
                              }}
                              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                              title="Renomear Tag"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Remover a tag #${t} de todas as ${count} notas?`
                                  )
                                ) {
                                  onDeleteTag(t);
                                }
                              }}
                              className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded transition"
                              title="Excluir Tag de todas as notas"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 3: PAGES & BATCH MANAGEMENT */}
        {activeTab === 'pages' && (
          <div className="space-y-5 max-w-6xl mx-auto">
            {/* Batch Action Bar */}
            <div className="p-4 bg-slate-950 rounded-xl border border-emerald-500/30 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleSelectAllNotes}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition border border-slate-700 cursor-pointer"
                  >
                    {selectedNoteIds.length === filteredNotes.length && filteredNotes.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                    <span>
                      {selectedNoteIds.length === filteredNotes.length && filteredNotes.length > 0
                        ? 'Desmarcar Todos'
                        : `Selecionar Todos (${filteredNotes.length})`}
                    </span>
                  </button>

                  <span className="text-xs text-slate-400 font-mono">
                    {selectedNoteIds.length} selecionada(s)
                  </span>
                </div>

                {selectedNoteIds.length > 0 && (
                  <button
                    onClick={handleApplyBatchDelete}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir Selecionadas ({selectedNoteIds.length})</span>
                  </button>
                )}
              </div>

              {/* Batch Inputs */}
              {selectedNoteIds.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
                  {/* Category batch */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={batchCategoryInput}
                      onChange={(e) => setBatchCategoryInput(e.target.value)}
                      placeholder="Nova categoria em massa..."
                      className="flex-1 px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                    <button
                      onClick={handleApplyBatchCategory}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shrink-0 cursor-pointer"
                    >
                      Aplicar Categoria
                    </button>
                  </div>

                  {/* Add Tags batch */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={batchAddTagsInput}
                      onChange={(e) => setBatchAddTagsInput(e.target.value)}
                      placeholder="Adicionar tags (#tag1 #tag2)..."
                      className="flex-1 px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                    <button
                      onClick={handleApplyBatchAddTags}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shrink-0 cursor-pointer"
                    >
                      Adicionar Tags
                    </button>
                  </div>

                  {/* Remove Tags batch */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={batchRemoveTagsInput}
                      onChange={(e) => setBatchRemoveTagsInput(e.target.value)}
                      placeholder="Remover tags (#tag)..."
                      className="flex-1 px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                    <button
                      onClick={handleApplyBatchRemoveTags}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg shrink-0 border border-slate-700 cursor-pointer"
                    >
                      Remover Tags
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={pageSearch}
                  onChange={(e) => setPageSearch(e.target.value)}
                  placeholder="Pesquisar por título ou conteúdo..."
                  className="w-full bg-transparent focus:outline-none text-white placeholder-slate-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-400">Cat:</span>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 text-xs"
                  >
                    <option value="ALL">Todas ({categories.length})</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-slate-400">Tag:</span>
                  <select
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 text-xs"
                  >
                    <option value="ALL">Todas ({tags.length})</option>
                    {tags.map((t) => (
                      <option key={t} value={t}>
                        #{t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Pages Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        checked={
                          selectedNoteIds.length === filteredNotes.length &&
                          filteredNotes.length > 0
                        }
                        onChange={toggleSelectAllNotes}
                        className="rounded bg-slate-800 border-slate-700 text-emerald-500"
                      />
                    </th>
                    <th className="p-3">Título da Página</th>
                    <th className="p-3">Categoria</th>
                    <th className="p-3">Tags Assumidas</th>
                    <th className="p-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredNotes.map((note) => {
                    const isSelected = selectedNoteIds.includes(note.id);
                    const isEditingTitle = editingNoteId === note.id;

                    return (
                      <tr
                        key={note.id}
                        className={`hover:bg-slate-900/60 transition ${
                          isSelected ? 'bg-slate-900/90' : ''
                        }`}
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectNote(note.id)}
                            className="rounded bg-slate-800 border-slate-700 text-emerald-500"
                          />
                        </td>

                        <td className="p-3">
                          {isEditingTitle ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editingNoteTitleInput}
                                onChange={(e) => setEditingNoteTitleInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveRenameNote(note.id);
                                  if (e.key === 'Escape') setEditingNoteId(null);
                                }}
                                className="bg-slate-900 border border-emerald-500 text-white px-2 py-1 rounded text-xs w-full"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveRenameNote(note.id)}
                                className="text-emerald-400 p-1"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span
                                onClick={() => {
                                  onNavigateToNote(note.id);
                                  onClose();
                                }}
                                className="font-semibold text-slate-100 hover:text-emerald-400 cursor-pointer font-serif text-sm"
                              >
                                {note.title}
                              </span>
                              <button
                                onClick={() => handleStartRenameNote(note)}
                                className="text-slate-500 hover:text-slate-300 p-0.5"
                                title="Editar título"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>

                        <td className="p-3">
                          <select
                            value={note.category || 'Geral'}
                            onChange={(e) => onUpdateNoteCategory(note.id, e.target.value)}
                            className="bg-slate-900 text-slate-300 border border-slate-800 rounded px-2 py-1 text-xs focus:outline-none focus:border-emerald-500"
                          >
                            {categories.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="p-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {note.tags.map((t) => (
                              <span
                                key={t}
                                className="text-[10px] bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded border border-slate-700 font-mono inline-flex items-center gap-1"
                              >
                                #{t}
                                <button
                                  onClick={() =>
                                    onUpdateNoteTags(
                                      note.id,
                                      note.tags.filter((item) => item !== t)
                                    )
                                  }
                                  className="text-slate-400 hover:text-rose-400"
                                >
                                  &times;
                                </button>
                              </span>
                            ))}
                            <button
                              onClick={() => {
                                const newT = prompt('Adicionar nova tag para esta nota:');
                                if (newT) {
                                  const cleaned = newT
                                    .replace(/^#+/, '')
                                    .trim()
                                    .toLowerCase()
                                    .replace(/[^a-z0-9-_]/g, '');
                                  if (cleaned && !note.tags.includes(cleaned)) {
                                    onUpdateNoteTags(note.id, [...note.tags, cleaned]);
                                  }
                                }
                              }}
                              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-bold"
                              title="Adicionar tag"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                onNavigateToNote(note.id);
                                onClose();
                              }}
                              className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1 bg-emerald-950/60 border border-emerald-800/80 px-2 py-1 rounded"
                            >
                              <span>Abrir</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
