import React, { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Note } from '../types';
import { replaceWikiLinksForRender } from '../utils/noteUtils';
import { Link as LinkIcon, ExternalLink, Copy, Check, Terminal } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  allNotes?: Note[];
  onNavigateToNote?: (noteId: string) => void;
  onCreateConceptNote?: (title: string) => void;
  className?: string;
}

// Custom CodeBlock component with language badge & copy button
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl border border-slate-800 bg-slate-900 text-slate-100 overflow-hidden shadow-md">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800/80 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold uppercase tracking-wider text-slate-300">
            {language || 'code'}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-sans font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-slate-400" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed text-emerald-300/90 selection:bg-emerald-950 selection:text-emerald-200">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  allNotes = [],
  onNavigateToNote,
  onCreateConceptNote,
  className = '',
}) => {
  // Preprocess wiki links [[Concept]] into [Concept](#wiki-note-ID) or [Concept](#wiki-create-Title)
  const processedContent = React.useMemo(() => {
    if (!content) return '';
    const notesByTitle = new Map<string, Note>();
    allNotes.forEach((n) => {
      notesByTitle.set(n.title.toLowerCase(), n);
    });
    return replaceWikiLinksForRender(content, notesByTitle);
  }, [content, allNotes]);

  return (
    <div className={`prose prose-slate max-w-none text-slate-800 leading-relaxed ${className}`}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom Headings
          h1: ({ children }) => (
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-slate-900 border-b border-slate-200/80 pb-2.5 mt-7 mb-4 tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl md:text-2xl font-bold font-serif text-slate-800 border-b border-slate-100 pb-2 mt-6 mb-3 tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg md:text-xl font-semibold text-slate-800 mt-5 mb-2.5">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold text-slate-700 mt-4 mb-2">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-sm font-semibold uppercase tracking-wider text-slate-600 mt-3 mb-1.5">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-3 mb-1">
              {children}
            </h6>
          ),

          // Custom Paragraphs
          p: ({ children }) => (
            <p className="my-3 leading-relaxed text-slate-700 text-sm md:text-base">
              {children}
            </p>
          ),

          // Custom Code handling
          pre: ({ children }) => <div className="my-3">{children}</div>,
          code: ({ node, inline, className: codeClassName, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(codeClassName || '');
            const codeString = String(children).replace(/\n$/, '');
            const isInline = inline || (!match && !codeString.includes('\n'));

            if (isInline) {
              return (
                <code
                  className="bg-slate-100 text-emerald-800 border border-slate-200/80 rounded px-1.5 py-0.5 font-mono text-[0.875em] font-medium"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return <CodeBlock language={match ? match[1] : ''} code={codeString} />;
          },

          // Custom Links
          a: ({ href, children }) => {
            if (!href) return <span>{children}</span>;

            // Wiki link to existing note
            if (href.startsWith('#wiki-note-')) {
              const targetId = href.replace('#wiki-note-', '');
              return (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigateToNote) onNavigateToNote(targetId);
                  }}
                  className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-900 border border-emerald-300/80 rounded px-2 py-0.5 text-[0.9em] transition-colors cursor-pointer my-0.5 shadow-2xs"
                  title="Abrir esta nota vinculada"
                >
                  <LinkIcon className="w-3 h-3 text-emerald-600 inline" />
                  {children}
                </button>
              );
            }

            // Wiki link to missing concept note
            if (href.startsWith('#wiki-create-')) {
              const rawTitle = decodeURIComponent(href.replace('#wiki-create-', ''));
              return (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onCreateConceptNote) onCreateConceptNote(rawTitle);
                  }}
                  className="inline-flex items-center gap-1 font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-dashed border-amber-300 rounded px-2 py-0.5 text-[0.9em] transition-colors cursor-pointer my-0.5 shadow-2xs"
                  title={`Criar nova nota para o conceito "${rawTitle}"`}
                >
                  <span className="text-amber-500 font-bold">+</span>
                  {children}
                </button>
              );
            }

            // External web link
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:text-emerald-900 font-semibold underline underline-offset-2 decoration-emerald-300 hover:decoration-emerald-600 inline-flex items-center gap-1 transition-colors"
              >
                {children}
                <ExternalLink className="w-3 h-3 inline text-emerald-600/80 shrink-0" />
              </a>
            );
          },

          // Custom Lists
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-6 space-y-1.5 my-3 text-slate-700 text-sm md:text-base">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-6 space-y-1.5 my-3 text-slate-700 text-sm md:text-base">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),

          // Custom Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-emerald-500 bg-emerald-50/60 pl-4 py-2.5 pr-3 my-4 italic text-slate-700 rounded-r-lg border-y border-r border-emerald-100 text-sm">
              {children}
            </blockquote>
          ),

          // Custom Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-5 border border-slate-200 rounded-xl shadow-2xs">
              <table className="w-full text-sm text-left border-collapse bg-white">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-100/80 text-slate-700 uppercase font-bold text-xs border-b border-slate-200">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-100">{children}</tbody>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 font-semibold text-slate-800">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5 text-slate-700">{children}</td>
          ),

          // Custom Divider
          hr: () => <hr className="my-6 border-slate-200/80" />,
        }}
      >
        {processedContent}
      </Markdown>
    </div>
  );
};
