import React, { useState } from 'react';
import { Note } from '../types';
import { slugify, extractWikiLinks } from '../utils/noteUtils';
import { Upload, FileText, Sparkles, X, Check } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportNotes: (newNotes: Note[]) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportNotes,
}) => {
  const [rawText, setRawText] = useState('');
  const [category, setCategory] = useState('Importado');
  const [autoLinkConcepts, setAutoLinkConcepts] = useState(true);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const importedList: Note[] = [];
    let pending = files.length;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const title = file.name.replace(/\.(md|txt|markdown)$/i, '');
          importedList.push({
            id: slugify(title),
            title,
            content: text,
            category: 'Importado',
            tags: ['importado', 'markdown'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
        pending--;
        if (pending === 0) {
          onImportNotes(importedList);
          onClose();
        }
      };
      reader.readAsText(file);
    });
  };

  const handleRawTextSubmit = () => {
    if (!rawText.trim()) return;

    // Split text into sections if headers exist, or treat as one comprehensive note
    const sections = rawText.split(/\n(?=#\s+|\n##\s+)/g);

    if (sections.length > 1) {
      // Multiple sections detected
      const newNotes: Note[] = sections
        .map((sec, idx) => {
          const lines = sec.trim().split('\n');
          const firstLine = lines[0] || '';
          let title = firstLine.replace(/^#+\s*/, '').trim() || `Anotação ${idx + 1}`;
          if (title.length > 60) title = title.substring(0, 57) + '...';

          return {
            id: slugify(title) + '-' + idx,
            title,
            content: sec.trim(),
            category: category.trim() || 'Geral',
            tags: ['importado', 'auto-organizado'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        })
        .filter((n) => n.content.length > 10);

      onImportNotes(newNotes);
    } else {
      // Single comprehensive note
      const firstLine = rawText.trim().split('\n')[0] || '';
      let title = firstLine.replace(/^#+\s*/, '').trim() || 'Anotação Importada';
      if (title.length > 60) title = title.substring(0, 57) + '...';

      onImportNotes([
        {
          id: slugify(title),
          title,
          content: rawText.trim(),
          category: category.trim() || 'Geral',
          tags: ['importado'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    }

    setRawText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 font-serif">
                Importar & Organizar Anotações
              </h3>
              <p className="text-xs text-slate-500">
                Cole textos ou faça upload de arquivos .md / .txt
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* File Upload Drop Zone */}
          <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-emerald-50/20 transition cursor-pointer relative">
            <input
              type="file"
              multiple
              accept=".md,.txt,.markdown"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700 mb-1">
              Arraste arquivos Markdown (.md) ou texto (.txt) aqui
            </p>
            <p className="text-[11px] text-slate-400">
              Ou clique para selecionar múltiplos arquivos do computador
            </p>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-xs text-slate-400 font-semibold uppercase tracking-wider absolute">
              OU COLE TEXTO BRUTO
            </span>
          </div>

          {/* Raw Text Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase text-slate-500">
                Anotações Brutas / Bloco de Notas
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Categoria (ex: Recon)"
                className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-300 rounded font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Cole aqui seu texto de anotações. Se houver múltiplos títulos (# Título), o sistema dividirá automaticamente em páginas wiki limpas..."
              className="w-full p-3 text-xs font-mono text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-y"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-200">
          <span className="text-xs text-slate-400">
            {rawText.trim().length > 0 ? `${rawText.trim().length} caracteres digitados` : 'Aguardando conteúdo'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleRawTextSubmit}
              disabled={!rawText.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Organizar & Importar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
