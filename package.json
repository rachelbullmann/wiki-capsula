import React, { useState, useEffect } from 'react';
import { Sparkles, Check, Copy, ArrowRight, RefreshCw, X, FileText, Globe, Zap, MessageSquare, CornerDownRight } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  fullContextText?: string;
  onApplyReplacement?: (newText: string) => void;
  onInsertBelow?: (newText: string) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  selectedText,
  fullContextText = '',
  onApplyReplacement,
  onInsertBelow,
}) => {
  const [activeAction, setActiveAction] = useState<string>('clarity');
  const [customInstruction, setCustomInstruction] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resultText, setResultText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && selectedText) {
      setResultText('');
      setErrorMsg('');
      setCopied(false);
    }
  }, [isOpen, selectedText]);

  if (!isOpen) return null;

  const handleRunAi = async (actionType: string = activeAction) => {
    if (!selectedText.trim()) return;

    setIsLoading(true);
    setErrorMsg('');
    setActiveAction(actionType);

    try {
      const response = await fetch('/api/ai/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedText,
          action: actionType,
          customInstruction: actionType === 'custom' ? customInstruction : undefined,
          fullContext: fullContextText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao solicitar revisão com a IA.');
      }

      setResultText(data.resultText || '');
    } catch (err: any) {
      console.error('Erro na solicitação da IA:', err);
      setErrorMsg(err.message || 'Ocorreu um erro ao conectar com o serviço de IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white border-b border-emerald-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-400/30 text-emerald-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                Assistente de IA
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                  Gemini Flash
                </span>
              </h2>
              <p className="text-xs text-slate-300">Revisão, ajuste, tradução e explicação inteligente de texto</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Selected Text Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Texto Selecionado ({selectedText.length} caracteres)
            </label>
            <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-700 font-mono max-h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {selectedText || <span className="text-slate-400 italic">Nenhum texto selecionado. Selecione um trecho no documento.</span>}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Escolha o Tipo de Ajuste:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRunAi('clarity')}
                disabled={isLoading}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium text-left transition cursor-pointer ${
                  activeAction === 'clarity'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Melhorar Clareza</span>
              </button>

              <button
                type="button"
                onClick={() => handleRunAi('grammar')}
                disabled={isLoading}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium text-left transition cursor-pointer ${
                  activeAction === 'grammar'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Corrigir Ortografia</span>
              </button>

              <button
                type="button"
                onClick={() => handleRunAi('explain')}
                disabled={isLoading}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium text-left transition cursor-pointer ${
                  activeAction === 'explain'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Explicar Conceito</span>
              </button>

              <button
                type="button"
                onClick={() => handleRunAi('summarize')}
                disabled={isLoading}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium text-left transition cursor-pointer ${
                  activeAction === 'summarize'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Resumir Seleção</span>
              </button>

              <button
                type="button"
                onClick={() => handleRunAi('translate_en')}
                disabled={isLoading}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium text-left transition cursor-pointer ${
                  activeAction === 'translate_en'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Traduzir p/ Inglês</span>
              </button>

              <button
                type="button"
                onClick={() => handleRunAi('expand')}
                disabled={isLoading}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium text-left transition cursor-pointer ${
                  activeAction === 'expand'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ArrowRight className="w-4 h-4 text-purple-500 shrink-0" />
                <span>Expandir / Exemplos</span>
              </button>
            </div>
          </div>

          {/* Custom Prompt Input */}
          <div className="pt-1">
            <div className="flex items-center gap-2 mb-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <label className="text-xs font-semibold text-slate-600">Ou digite uma instrução personalizada:</label>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder="Ex: Formate em tópicos com comandos de terminal..."
                className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRunAi('custom');
                }}
              />
              <button
                type="button"
                onClick={() => handleRunAi('custom')}
                disabled={isLoading || !customInstruction.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Executar
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="p-8 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex flex-col items-center justify-center gap-3 text-emerald-900 animate-pulse">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
              <p className="text-xs font-semibold">Processando com a Inteligência Artificial...</p>
              <span className="text-[11px] text-slate-500">Aprimorando termos técnicos e mantendo sintaxe intacta</span>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2">
              <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Erro:</span> {errorMsg}
              </div>
            </div>
          )}

          {/* AI Result Box */}
          {resultText && !isLoading && (
            <div className="space-y-2 animate-fade-in pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Sugestão da IA
                </label>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>

              <div className="p-4 bg-slate-900/90 text-slate-100 rounded-xl border border-slate-800 font-sans text-xs max-h-60 overflow-y-auto">
                <MarkdownRenderer content={resultText} className="prose-invert" />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 rounded-xl transition cursor-pointer"
          >
            Cancelar
          </button>

          {resultText && (
            <div className="flex items-center gap-2">
              {onInsertBelow && (
                <button
                  type="button"
                  onClick={() => {
                    onInsertBelow(resultText);
                    onClose();
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CornerDownRight className="w-3.5 h-3.5 text-slate-500" />
                  Inserir Abaixo
                </button>
              )}

              {onApplyReplacement && (
                <button
                  type="button"
                  onClick={() => {
                    onApplyReplacement(resultText);
                    onClose();
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Substituir Seleção
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
