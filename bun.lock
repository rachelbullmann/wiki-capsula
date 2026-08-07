import React, { useState } from 'react';
import { Note } from '../types';
import { Search, Tag, Folder, Plus, BookOpen, FileText, ArrowUpDown, Clock, SlidersHorizontal } from 'lucide-react';

interface SidebarProps {
  notes: Note[];
  selectedNoteId?: string;
  categories: string[];
  tags: string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  onSelectNote: (noteId: string) => void;
  onCreateNew: () => void;
  onExportAll: () => void;
  onOpenGlobalManager?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  notes,
  selectedNoteId,
  categories,
  tags,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  selectedTag,
  onSelectTag,
  onSelectNote,
  onCreateNew,
  onExportAll,
  onOpenGlobalManager,
}) => {
  const [sortBy, setSortBy] = useState<'updated' | 'title'>('updated');

  // Filter notes
  const filteredNotes = notes
    .filter((note) => {
      // Category filter
      if (selectedCategory && note.category !== selectedCategory) return false;
      // Tag filter
      if (selectedTag && !note.tags.includes(selectedTag)) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = note.title.toLowerCase().includes(q);
        const matchesContent = note.content.toLowerCase().includes(q);
        const matchesTag = note.tags.some((t) => t.toLowerCase().includes(q));
        const matchesCategory = note.category?.toLowerCase().includes(q);
        return matchesTitle || matchesContent || matchesTag || matchesCategory;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  return (
    <div className="w-full lg:w-80 flex flex-col bg-slate-900 text-slate-100 rounded-xl border border-slate-800 shadow-xl overflow-hidden h-full">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center font-bold text-white shadow-md border border-emerald-500/30">
            <BookOpen className="w-4 h-4 text-emerald-100" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-serif leading-tight">
              Radar do Dragão
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">Capsule Corp. • {notes.length} notas</p>
          </div>
        </div>

        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3 py-2 rounded-lg shadow-sm transition cursor-pointer"
          title="Criar nova nota"
        >
          <Plus className="w-4 h-4" />
          Nova
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-900/60">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Pesquisar anotações, tags ou conteúdo..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-200"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Category & Tag Filter Pills */}
      <div className="p-3 border-b border-slate-800/80 space-y-2 text-xs bg-slate-900/40">
        {/* Categories */}
        <div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
            <span>Categorias ({categories.length})</span>
            <div className="flex items-center gap-2">
              {onOpenGlobalManager && (
                <button
                  onClick={onOpenGlobalManager}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold text-[10px] normal-case flex items-center gap-1 cursor-pointer"
                  title="Abrir Gerenciador Global"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  Gerenciar
                </button>
              )}
              {selectedCategory && (
                <button
                  onClick={() => onSelectCategory(null)}
                  className="text-emerald-400 hover:underline font-normal text-[10px] normal-case cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>
          </span>
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
            <button
              onClick={() => onSelectCategory(null)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                selectedCategory === null
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(selectedCategory === cat ? null : cat)}
                className={`px-2 py-0.5 rounded text-[11px] transition flex items-center gap-1 ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Folder className="w-3 h-3 text-slate-400" />
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="pt-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center justify-between">
              <span>Tags Populares ({tags.length})</span>
              {selectedTag && (
                <button
                  onClick={() => onSelectTag(null)}
                  className="text-emerald-400 hover:underline font-normal text-[10px] normal-case"
                >
                  Limpar Tag
                </button>
              )}
            </span>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onSelectTag(selectedTag === tag ? null : tag)}
                  className={`px-2 py-0.5 rounded-full text-[10px] transition ${
                    selectedTag === tag
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sorting Header */}
      <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span>{filteredNotes.length} resultados encontrados</span>
        <button
          onClick={() => setSortBy(sortBy === 'updated' ? 'title' : 'updated')}
          className="hover:text-slate-200 flex items-center gap-1 transition"
        >
          <ArrowUpDown className="w-3 h-3" />
          <span>{sortBy === 'updated' ? 'Mais recentes' : 'Por título (A-Z)'}</span>
        </button>
      </div>

      {/* Note List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-8 px-4 text-slate-400 text-xs">
            <p className="font-semibold text-slate-400 mb-1">Nenhuma nota encontrada</p>
            <p className="text-[11px]">Tente ajustar a busca ou limpar os filtros de categoria/tags.</p>
          </div>
        ) : (
          filteredNotes.map((note) => {
            const isSelected = note.id === selectedNoteId;
            return (
              <div
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={`p-3 rounded-lg cursor-pointer transition border ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500/80 text-white shadow-sm'
                    : 'bg-slate-900/50 border-transparent hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3
                    className={`text-xs font-semibold line-clamp-1 ${
                      isSelected ? 'text-emerald-400 font-serif' : 'text-slate-200'
                    }`}
                  >
                    {note.title}
                  </h3>
                  {note.category && (
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700/60 whitespace-nowrap">
                      {note.category}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 mb-2 font-mono text-[10px] leading-relaxed">
                  {note.content.replace(/[#*`_]/g, '').substring(0, 100)}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1">
                    {note.tags.slice(0, 2).map((t) => (
                      <span key={t} className="text-slate-400">
                        #{t}
                      </span>
                    ))}
                    {note.tags.length > 2 && <span>+{note.tags.length - 2}</span>}
                  </div>
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(note.updatedAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer / Export All Button */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80">
        <button
          onClick={onExportAll}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-lg transition border border-slate-700/80 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Exportar Todas em Markdown (.zip)</span>
        </button>
      </div>
    </div>
  );
};
