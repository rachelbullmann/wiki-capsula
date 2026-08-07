import React, { useState, useEffect, useRef } from 'react';
import { Note } from '../types';
import { Save, X, Tag, Folder, Info, Sparkles } from 'lucide-react';
import { AIAssistantModal } from './AIAssistantModal';
import { MarkdownRenderer } from './MarkdownRenderer';

interface NoteEditorProps {
  note?: Note | null;
  initialTitle?: string;
  onSave: (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  allNoteTitles: string[];
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  initialTitle = '',
  onSave,
  onCancel,
  allNoteTitles,
}) => {
  const [title, setTitle] = useState(note?.title || initialTitle);
  const [content, setContent] = useState(
    note?.content ||
      `# ${initialTitle || 'Nova Anotação'}\n\nEscreva suas anotações aqui.\n\nUse \`[[Nome do Conceito]]\` para vincular ideias!`
  );
  const [category, setCategory] = useState(note?.category || 'Geral');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(note?.tags || ['wiki']);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'split'>('split');

  // AI Modal States
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setCategory(note.category || 'Geral');
      setTags(note.tags);
    }
  }, [note]);

  const parseTags = (input: string): string[] => {
    if (!input) return [];
    const tokens = input.split(/[\s,;]+/);
    const result: string[] = [];
    for (const token of tokens) {
      const cleaned = token.replace(/^#+/, '').trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
      if (cleaned && !result.includes(cleaned)) {
        result.push(cleaned);
      }
    }
    return result;
  };

  const addParsedTags = (inputStr: string) => {
    const newTags = parseTags(inputStr);
    if (newTags.length > 0) {
      setTags((prev) => {
        const set = new Set([...prev, ...newTags]);
        return Array.from(set);
      });
      setTagInput('');
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',' || e.key === ';') {
      e.preventDefault();
      addParsedTags(tagInput);
    }
  };

  const handlePasteTag = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteText = e.clipboardData.getData('text');
    if (pasteText) {
      e.preventDefault();
      addParsedTags(pasteText);
    }
  };

  const handleBlurTag = () => {
    if (tagInput.trim()) {
      addParsedTags(tagInput);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      content,
      category: category.trim() || 'Geral',
      tags,
    });
  };

  // Quick helper to insert [[Link]] at cursor
  const insertWikiLinkPrompt = () => {
    const conceptName = prompt('Digite o nome do conceito a vincular:');
    if (conceptName) {
      if (textareaRef.current) {
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const inserted = `[[${conceptName.trim()}]]`;
        const newContent = content.substring(0, start) + inserted + content.substring(end);
        setContent(newContent);
      } else {
        setContent((prev) => `${prev} [[${conceptName.trim()}]]`);
      }
    }
  };

  // Open AI modal with current selected text in textarea or prompt
  const handleOpenAiAssistant = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const sel = content.substring(start, end).trim();
      if (sel) {
        setSelectedText(sel);
      } else {
        setSelectedText(content.substring(0, 1000));
      }
    } else {
      setSelectedText(content.substring(0, 1000));
    }
    setIsAiModalOpen(true);
  };

  const handleApplyAiReplacement = (newText: string) => {
    if (textareaRef.current && textareaRef.current.selectionStart !== textareaRef.current.selectionEnd) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newContent = content.substring(0, start) + newText + content.substring(end);
      setContent(newContent);
    } else if (selectedText && content.includes(selectedText)) {
      setContent(content.replace(selectedText, newText));
    } else {
      setContent((prev) => `${prev}\n\n${newText}`);
    }
  };

  const handleApplyAiInsertBelow = (newText: string) => {
    if (textareaRef.current && textareaRef.current.selectionStart !== textareaRef.current.selectionEnd) {
      const end = textareaRef.current.selectionEnd;
      const newContent = content.substring(0, end) + `\n\n${newText}\n` + content.substring(end);
      setContent(newContent);
    } else {
      setContent((prev) => `${prev}\n\n${newText}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">
            {note ? 'Editar Nota Wiki' : 'Nova Anotação Wiki'}
          </span>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-lg text-xs font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`px-2.5 py-1 rounded transition cursor-pointer ${
              activeTab === 'edit' ? 'bg-white text-slate-800 shadow-2xs font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Apenas Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('split')}
            className={`hidden md:block px-2.5 py-1 rounded transition cursor-pointer ${
              activeTab === 'split' ? 'bg-white text-slate-800 shadow-2xs font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Lado a Lado
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-2.5 py-1 rounded transition cursor-pointer ${
              activeTab === 'preview' ? 'bg-white text-slate-800 shadow-2xs font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Pré-visualizar
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            Salvar Nota
          </button>
        </div>
      </div>

      {/* Metadata Form Inputs */}
      <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
            Título da Nota / Conceito
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Reconhecimento de Redes, DNS Enumeration..."
            required
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1 flex items-center gap-1">
            <Folder className="w-3 h-3" /> Categoria
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Ex: Reconnaissance, AD, Web"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Tags input */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Tags (Separe por espaço, vírgula ou cole múltiplas: #PassiveRecon #ActiveRecon #Nmap...)
          </label>
          <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-300 rounded-lg p-2 min-h-[42px]">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-full border border-slate-200"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-slate-400 hover:text-slate-600 ml-0.5"
                >
                  &times;
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              onPaste={handlePasteTag}
              onBlur={handleBlurTag}
              placeholder={tags.length === 0 ? 'Ex: #PassiveRecon #ActiveRecon #Nmap #WhoisFreaks...' : 'Adicionar mais tags...'}
              className="flex-1 min-w-[180px] text-xs bg-transparent focus:outline-none text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Formatting & Wiki-link Helper Bar */}
      <div className="px-6 py-2 bg-slate-100/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={insertWikiLinkPrompt}
            className="inline-flex items-center gap-1 font-mono font-semibold px-2 py-1 bg-white border border-slate-300 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 rounded transition cursor-pointer"
            title="Inserir vínculo a outro conceito ou nota"
          >
            <span>[[Vincular Conceito]]</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAiAssistant}
            className="inline-flex items-center gap-1.5 font-semibold px-2.5 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 rounded transition cursor-pointer"
            title="Revisar texto selecionado com Inteligência Artificial"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Revisar com IA</span>
          </button>

          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-slate-500 text-[11px] hidden sm:inline">
            Selecione qualquer trecho para revisar com a IA ou use <code className="bg-white px-1 py-0.5 rounded border border-slate-200 font-mono text-emerald-700">[[Link]]</code>
          </span>
        </div>

        <div className="text-slate-500 text-[11px] flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Suporta Markdown completo</span>
        </div>
      </div>

      {/* Editor & Preview Split View */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-x divide-slate-200 overflow-hidden">
        {/* Editor Area */}
        {(activeTab === 'edit' || activeTab === 'split') && (
          <div className={`p-4 flex flex-col h-full bg-white ${activeTab === 'edit' ? 'md:col-span-2' : ''}`}>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva em Markdown..."
              className="w-full h-full flex-1 p-3 text-sm font-mono text-slate-800 bg-slate-50/50 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed"
            />
          </div>
        )}

        {/* Live Preview Area */}
        {(activeTab === 'preview' || activeTab === 'split') && (
          <div className={`p-6 overflow-y-auto bg-slate-50/30 h-full ${activeTab === 'preview' ? 'md:col-span-2' : ''}`}>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200">
              Pré-visualização em Tempo Real
            </h2>
            <MarkdownRenderer content={content} />
          </div>
        )}
      </div>

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        selectedText={selectedText || content.substring(0, 500)}
        fullContextText={content}
        onApplyReplacement={handleApplyAiReplacement}
        onInsertBelow={handleApplyAiInsertBelow}
      />
    </form>
  );
};
