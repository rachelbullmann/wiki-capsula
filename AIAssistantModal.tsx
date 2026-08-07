import { Note, GraphNode, GraphLink, WikiLink, Backlink } from '../types';

// Regular expression to match [[Wiki Link]] or [[Wiki Link|Display Alias]]
export const WIKI_LINK_REGEX = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

/**
 * Extracts all [[Wiki Links]] target titles from markdown content
 */
export function extractWikiLinks(content: string, sourceId: string): WikiLink[] {
  const links: WikiLink[] = [];
  let match;
  // Reset regex
  const regex = new RegExp(WIKI_LINK_REGEX);
  while ((match = regex.exec(content)) !== null) {
    const targetTitle = match[1].trim();
    if (targetTitle) {
      links.push({
        sourceId,
        targetTitle,
      });
    }
  }
  return links;
}

/**
 * Finds all backlinks pointing to a target note title
 */
export function getBacklinks(notes: Note[], targetTitle: string, currentNoteId: string): Backlink[] {
  const backlinks: Backlink[] = [];
  const lowerTarget = targetTitle.toLowerCase();

  notes.forEach((note) => {
    if (note.id === currentNoteId) return;

    const regex = new RegExp(WIKI_LINK_REGEX);
    let match;
    while ((match = regex.exec(note.content)) !== null) {
      if (match[1].trim().toLowerCase() === lowerTarget) {
        // Extract a snippet around the match
        const index = match.index;
        const start = Math.max(0, index - 40);
        const end = Math.min(note.content.length, index + match[0].length + 40);
        let snippet = note.content.substring(start, end).replace(/\n/g, ' ');
        if (start > 0) snippet = '...' + snippet;
        if (end < note.content.length) snippet = snippet + '...';

        backlinks.push({
          sourceNoteId: note.id,
          sourceNoteTitle: note.title,
          snippet,
        });
        break; // Count once per note
      }
    }
  });

  return backlinks;
}

/**
 * Normalizes content by converting wiki links to markdown link syntax or custom HTML for rendering
 */
export function replaceWikiLinksForRender(
  content: string,
  notesByTitle: Map<string, Note>
): string {
  return content.replace(WIKI_LINK_REGEX, (_match, title: string, alias?: string) => {
    const cleanTitle = title.trim();
    const displayText = alias ? alias.trim() : cleanTitle;
    const note = notesByTitle.get(cleanTitle.toLowerCase());
    if (note) {
      // Exist: link to note
      return `[${displayText}](#wiki-note-${note.id})`;
    } else {
      // Missing note concept link: show special styling or hashtag
      return `[${displayText} ?](#wiki-create-${encodeURIComponent(cleanTitle)})`;
    }
  });
}

/**
 * Builds nodes and links for D3 Force Graph visualization
 */
export function buildGraphData(notes: Note[]): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodesMap = new Map<string, GraphNode>();
  const links: GraphLink[] = [];

  const notesByTitle = new Map<string, Note>();
  notes.forEach((n) => {
    notesByTitle.set(n.title.toLowerCase(), n);
  });

  // 1. Add all note nodes
  notes.forEach((note) => {
    nodesMap.set(note.id, {
      id: note.id,
      title: note.title,
      type: 'note',
      val: 1,
      tags: note.tags,
    });
  });

  // 2. Extract links and add virtual/concept nodes for target titles that don't exist yet
  notes.forEach((note) => {
    const wikiLinks = extractWikiLinks(note.content, note.id);
    const connectionCount = wikiLinks.length;
    const sourceNode = nodesMap.get(note.id);
    if (sourceNode) {
      sourceNode.val += connectionCount * 0.5;
    }

    wikiLinks.forEach((wl) => {
      const targetNote = notesByTitle.get(wl.targetTitle.toLowerCase());
      if (targetNote) {
        // Link between existing notes
        links.push({
          source: note.id,
          target: targetNote.id,
          value: 1,
        });
        const targetNode = nodesMap.get(targetNote.id);
        if (targetNode) {
          targetNode.val += 1;
        }
      } else {
        // Concept node that doesn't have an explicit note yet
        const conceptId = `concept-${wl.targetTitle.toLowerCase().replace(/\s+/g, '-')}`;
        if (!nodesMap.has(conceptId)) {
          nodesMap.set(conceptId, {
            id: conceptId,
            title: wl.targetTitle,
            type: 'concept',
            val: 1,
            tags: ['conceito-não-criado'],
          });
        } else {
          const conceptNode = nodesMap.get(conceptId);
          if (conceptNode) conceptNode.val += 1;
        }

        links.push({
          source: note.id,
          target: conceptId,
          value: 1,
        });
      }
    });
  });

  // Check for orphan notes
  nodesMap.forEach((node) => {
    const isConnected = links.some(
      (l) =>
        (typeof l.source === 'string' ? l.source : l.source.id) === node.id ||
        (typeof l.target === 'string' ? l.target : l.target.id) === node.id
    );
    if (!isConnected && node.type === 'note') {
      node.type = 'orphan';
    }
  });

  return {
    nodes: Array.from(nodesMap.values()),
    links,
  };
}

/**
 * Downloads a markdown string as a file
 */
export function downloadMarkdownFile(filename: string, content: string) {
  const element = document.createElement('a');
  const file = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  element.href = URL.createObjectURL(file);
  element.download = filename.endsWith('.md') ? filename : `${filename}.md`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Slugify title into ID
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || `note-${Date.now()}`;
}
