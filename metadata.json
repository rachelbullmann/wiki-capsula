import JSZip from 'jszip';
import { Note } from '../types';

export function downloadSingleNoteMarkdown(note: Note) {
  const filename = `${note.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
  const blob = new Blob([note.content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function downloadAllNotesZip(notes: Note[]) {
  const zip = new JSZip();

  notes.forEach((note) => {
    const filename = `${note.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    const folder = note.category ? zip.folder(note.category.replace(/[^a-z0-9]+/gi, '_')) : zip;
    if (folder) {
      folder.file(filename, note.content);
    } else {
      zip.file(filename, note.content);
    }
  });

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = `wiki_anotacoes_export_${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
