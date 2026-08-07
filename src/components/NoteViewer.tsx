import React, { useState, useEffect, useRef } from 'react';
import { Note, Backlink } from '../types';
import { Calendar, Tag, Folder, Link as LinkIcon, Edit3, Trash2, Download, Sparkles } from 'lucide-react';
import { AIAssistantModal } from './AIAssistantModal';
import { MarkdownRenderer } from './MarkdownRenderer';

interface NoteViewerProps {
  note: Note;
  backlinks: Backlink[];
  allNotes?: Note[];
  onEdit: () => void;
  onDelete: () => void;
  onNavigateToNote: (noteId: string) => void;
  onCreateConceptNote: (title: string) => void;
  onExportNote: (note: Note) => void;
  onSelectTag?: (tag: string) => void;
  onUpdateNoteContent?: (noteId: string, updatedContent: string) => void;
}

export const NoteViewer: React.FC<NoteViewerProps> = ({
  note,
  backlinks,
  allNotes = [],
  onEdit,
  onDelete,
  onNavigateToNote,
  onCreateConceptNote,
  onExportNote,
  onSelectTag,
  onUpdateNoteContent,
}) => {
  const [selectedText, setSelectedText] = useState<string>('');
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [floatingPos, setFloatingPos] = useState<{ x: number; y: number } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Format date
  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // Detect text selection in document for floating button
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 2) {
        const text = selection.toString().trim();
        // Check if selection is inside contentRef
        if (contentRef.current && contentRef.current.contains(selection.anchorNode)) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setSelectedText(text);
          setFloatingPos({
            x: Math.min(Math.max(rect.left + rect.width / 2, 100), window.innerWidth - 100),
            y: Math.max(rect.top - 45, 20),
          });
          return;
        }
      }
      setFloatingPos(null);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  // Custom link renderer to catch #wiki-note-ID and #wiki-create-TITLE
  const renderLink = ({ href, children }: { href?: string; children?: React.ReactNode }) => {
    if (!href) return <a>{children}</a>;

    if (href.startsWith('#wiki-note-')) {
      const targetId = href.replace('#wiki-note-', '');
      return (
        <button
          onClick={(e) => {
            e.preventDefault();
            onNavigateToNote(targetId);
          }}
          className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-900 border border-emerald-200/70 rounded px-1.5 py-0.5 text-[0.92em] transition-colors cursor-pointer my-0.5"
          title="Clique para abrir esta nota"
        >
          <LinkIcon className="w-3 h-3 text-emerald-600 inline" />
          {children}
        </button>
      );
    }

    if (href.startsWith('#wiki-create-')) {
      const rawTitle = decodeURIComponent(href.replace('#wiki-create-', ''));
      return (
        <button
          onClick={(e) => {
            e.preventDefault();
            onCreateConceptNote(rawTitle);
          }}
          className="inline-flex items-center gap-1 font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-dashed border-amber-300 rounded px-1.5 py-0.5 text-[0.92em] transition-colors cursor-pointer my-0.5"
          title={`Criar nova nota para o conceito "${rawTitle}"`}
        >
          <span className="text-amber-500 font-bold">+</span>
          {children}
        </button>
      );
    }

    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline inline-flex items-center gap-0.5 font-medium"
      >
        {children}
      </a>
    );
  };

  const handleApplyReplacement = (newText: string) => {
    if (!onUpdateNoteContent) return;
    if (selectedText && note.content.includes(selectedText)) {
      const updated = note.content.replace(selectedText, newText);
      onUpdateNoteContent(note.id, updated);
    } else {
      // Append or replace whole
      onUpdateNoteContent(note.id, `${note.content}\n\n### Revisão pela IA:\n${newText}`);
    }
  };

  const handleInsertBelow = (newText: string) => {
    if (!onUpdateNoteContent) return;
    if (selectedText && note.content.includes(selectedText)) {
      const updated = note.content.replace(selectedText, `${selectedText}\n\n> **Nota de IA:** ${newText}\n`);
      onUpdateNoteContent(note.id, updated);
    } else {
      onUpdateNoteContent(note.id, `${note.content}\n\n${newText}`);
    }
  };

  const openAiWithCurrentSelectionOrContent = () => {
    const sel = window.getSelection()?.toString().trim();
    if (sel && sel.length > 2) {
      setSelectedText(sel);
    } else {
      setSelectedText(note.content.substring(0, 1000));
    }
    setIsAiModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden relative">
      {/* Floating Selection AI Button */}
      {floatingPos && (
        <div
          style={{
            position: 'fixed',
            left: `${floatingPos.x}px`,
            top: `${floatingPos.y}px`,
            transform: 'translateX(-50%)',
          }}
          className="z-40 animate-bounce-short"
        >
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-emerald-900 text-white text-xs font-semibold rounded-full shadow-xl border border-emerald-400/40 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Revisar com IA
          </button>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-50/70 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          {note.category && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 bg-slate-200/80 px-2.5 py-1 rounded-md">
              <Folder className="w-3.5 h-3.5 text-slate-500" />
              {note.category}
            </span>
          )}
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Atualizado em {formatDate(note.updatedAt)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Helper Button */}
          <button
            onClick={openAiWithCurrentSelectionOrContent}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-2xs transition cursor-pointer"
            title="Usar Assistente de IA para revisar, explicar ou traduzir o texto selecionado"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Revisar com IA
          </button>

          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
            Editar
          </button>

          <button
            onClick={() => onExportNote(note)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition"
            title="Exportar em formato Markdown (.md)"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            Exportar MD
          </button>

          <button
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
            title="Excluir nota"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div ref={contentRef} className="flex-1 overflow-y-auto p-6 md:p-8">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 tracking-tight font-serif">
          {note.title}
        </h1>

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-6 pb-4 border-b border-slate-100">
            <Tag className="w-3.5 h-3.5 text-slate-400 mr-1" />
            {note.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onSelectTag && onSelectTag(tag)}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full font-medium transition cursor-pointer"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Markdown Rendered View */}
        <MarkdownRenderer
          content={note.content}
          allNotes={allNotes}
          onNavigateToNote={onNavigateToNote}
          onCreateConceptNote={onCreateConceptNote}
        />

        {/* Backlinks / Mentioned In Section */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-emerald-600" />
            Referências Cruzadas & Backlinks ({backlinks.length})
          </h3>

          {backlinks.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              Nenhuma outra nota menciona esta página com <code className="bg-slate-100 px-1 py-0.5 rounded">[[{note.title}]]</code> ainda.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {backlinks.map((bl) => (
                <div
                  key={bl.sourceNoteId}
                  onClick={() => onNavigateToNote(bl.sourceNoteId)}
                  className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition group"
                >
                  <div className="text-xs font-semibold text-emerald-700 group-hover:text-emerald-800 flex items-center gap-1.5 mb-1">
                    <LinkIcon className="w-3 h-3 text-emerald-500" />
                    {bl.sourceNoteTitle}
                  </div>
                  <p className="text-xs text-slate-600 font-mono line-clamp-2 bg-white/70 p-1.5 rounded border border-slate-200/50">
                    {bl.snippet}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        selectedText={selectedText || note.content.substring(0, 500)}
        fullContextText={note.content}
        onApplyReplacement={handleApplyReplacement}
        onInsertBelow={handleInsertBelow}
      />
    </div>
  );
};
