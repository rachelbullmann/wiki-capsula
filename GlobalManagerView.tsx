import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GraphNode, GraphLink } from '../types';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RefreshCw, Eye } from 'lucide-react';

interface GraphViewProps {
  nodes: GraphNode[];
  links: GraphLink[];
  selectedNoteId?: string;
  onSelectNode: (nodeId: string, nodeTitle: string, isConcept: boolean) => void;
}

export const GraphView: React.FC<GraphViewProps> = ({
  nodes,
  links,
  selectedNoteId,
  onSelectNode,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'notes' | 'concepts'>('all');
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Clear SVG
    d3.select(svgRef.current).selectAll('*').remove();

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 500;

    // Filter nodes/links based on type filter
    let filteredNodes = [...nodes];
    if (filterType === 'notes') {
      filteredNodes = filteredNodes.filter((n) => n.type === 'note' || n.type === 'orphan');
    } else if (filterType === 'concepts') {
      filteredNodes = filteredNodes.filter((n) => n.type === 'concept');
    }

    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredLinks = links
      .filter((l) => {
        const sId = typeof l.source === 'object' ? l.source.id : l.source;
        const tId = typeof l.target === 'object' ? l.target.id : l.target;
        return filteredNodeIds.has(sId) && filteredNodeIds.has(tId);
      })
      .map((l) => ({ ...l })); // Clone link objects

    // Deep clone nodes to prevent D3 mutation issues across re-renders
    const d3Nodes: GraphNode[] = filteredNodes.map((n) => ({ ...n }));

    // Create SVG Zoom Container
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    // D3 Force Simulation
    const simulation = d3
      .forceSimulation<GraphNode>(d3Nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(filteredLinks)
          .id((d) => d.id)
          .distance(90)
      )
      .force('charge', d3.forceManyBody().strength(-220))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => Math.max(16, d.val * 5 + 12)));

    // Render Links
    const linkGroup = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(filteredLinks)
      .enter()
      .append('line')
      .attr('stroke', (d: any) => {
        const sId = typeof d.source === 'object' ? d.source.id : d.source;
        const tId = typeof d.target === 'object' ? d.target.id : d.target;
        if (selectedNoteId && (sId === selectedNoteId || tId === selectedNoteId)) {
          return '#3b82f6'; // Highlight active link
        }
        return '#cbd5e1';
      })
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: any) => {
        const sId = typeof d.source === 'object' ? d.source.id : d.source;
        const tId = typeof d.target === 'object' ? d.target.id : d.target;
        return selectedNoteId && (sId === selectedNoteId || tId === selectedNoteId) ? 2.5 : 1.2;
      })
      .attr('stroke-dasharray', (d: any) => {
        // Dashed lines for uncreated concepts
        const targetNode = typeof d.target === 'object' ? d.target : d3Nodes.find((n) => n.id === d.target);
        return targetNode && targetNode.type === 'concept' ? '4 3' : 'none';
      });

    // Render Node Groups
    const nodeGroup = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(d3Nodes)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .on('click', (_event, d) => {
        onSelectNode(d.id, d.title, d.type === 'concept');
      })
      .on('mouseover', (_event, d) => setHoveredNode(d))
      .on('mouseout', () => setHoveredNode(null));

    // Node Circles
    nodeGroup
      .append('circle')
      .attr('r', (d) => Math.min(24, Math.max(7, 6 + d.val * 2)))
      .attr('fill', (d) => {
        if (d.id === selectedNoteId) return '#3b82f6'; // Active selection blue
        if (d.type === 'concept') return '#f59e0b'; // Amber for uncreated concept
        if (d.type === 'orphan') return '#94a3b8'; // Slate for orphan
        return '#10b981'; // Emerald for created notes
      })
      .attr('stroke', (d) => (d.id === selectedNoteId ? '#1e40af' : '#ffffff'))
      .attr('stroke-width', (d) => (d.id === selectedNoteId ? 3 : 1.5))
      .attr('class', 'transition-all duration-200 hover:scale-125');

    // Halo pulse ring for selected note
    nodeGroup
      .filter((d) => d.id === selectedNoteId)
      .append('circle')
      .attr('r', (d) => Math.min(30, Math.max(12, 10 + d.val * 2)))
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.4)
      .attr('class', 'animate-pulse');

    // Node Labels
    nodeGroup
      .append('text')
      .text((d) => (d.title.length > 20 ? d.title.substring(0, 18) + '...' : d.title))
      .attr('x', (d) => Math.min(24, Math.max(7, 6 + d.val * 2)) + 6)
      .attr('y', 4)
      .attr('font-size', (d) => (d.id === selectedNoteId ? '13px' : '11px'))
      .attr('font-weight', (d) => (d.id === selectedNoteId ? '700' : '500'))
      .attr('fill', (d) => (d.id === selectedNoteId ? '#1e293b' : '#475569'))
      .attr('pointer-events', 'none')
      .style('font-family', 'sans-serif');

    // Drag behavior
    const drag = d3
      .drag<SVGGElement, GraphNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeGroup.call(drag as any);

    // Simulation tick
    simulation.on('tick', () => {
      linkGroup
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeGroup.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Handle Zoom Control Buttons
    const zoomInBtn = document.getElementById('graph-zoom-in');
    const zoomOutBtn = document.getElementById('graph-zoom-out');
    const zoomResetBtn = document.getElementById('graph-zoom-reset');

    if (zoomInBtn) {
      zoomInBtn.onclick = () => svg.transition().duration(300).call(zoom.scaleBy as any, 1.3);
    }
    if (zoomOutBtn) {
      zoomOutBtn.onclick = () => svg.transition().duration(300).call(zoom.scaleBy as any, 0.7);
    }
    if (zoomResetBtn) {
      zoomResetBtn.onclick = () => svg.transition().duration(300).call(zoom.transform as any, d3.zoomIdentity);
    }

    return () => {
      simulation.stop();
    };
  }, [nodes, links, selectedNoteId, filterType, isFullscreen]);

  return (
    <div
      ref={containerRef}
      className={`relative bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-inner flex flex-col ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl bg-white' : 'w-full h-[550px]'
      }`}
    >
      {/* Control Bar */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/90 backdrop-blur border border-slate-200/80 px-3 py-1.5 rounded-lg shadow-sm text-xs text-slate-700">
        <span className="font-semibold text-slate-500 mr-1">Filtrar:</span>
        <button
          onClick={() => setFilterType('all')}
          className={`px-2 py-0.5 rounded transition ${
            filterType === 'all'
              ? 'bg-slate-800 text-white font-medium'
              : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          Todos ({nodes.length})
        </button>
        <button
          onClick={() => setFilterType('notes')}
          className={`px-2 py-0.5 rounded transition ${
            filterType === 'notes'
              ? 'bg-emerald-600 text-white font-medium'
              : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          Notas Existentes
        </button>
        <button
          onClick={() => setFilterType('concepts')}
          className={`px-2 py-0.5 rounded transition ${
            filterType === 'concepts'
              ? 'bg-amber-600 text-white font-medium'
              : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          Conceitos ([[mencionados]])
        </button>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur border border-slate-200/80 p-1 rounded-lg shadow-sm">
        <button
          id="graph-zoom-in"
          title="Aumentar Zoom"
          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          id="graph-zoom-out"
          title="Diminuir Zoom"
          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          id="graph-zoom-reset"
          title="Resetar Posição"
          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition ml-1 border-l border-slate-200"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Legend Footer */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-4 bg-white/90 backdrop-blur border border-slate-200/80 px-3 py-1.5 rounded-lg shadow-sm text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          <span>Nota Existente</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
          <span>Conceito Mencionado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
          <span>Nota Selecionada</span>
        </div>
      </div>

      {/* Node Hover Tooltip */}
      {hoveredNode && (
        <div className="absolute bottom-3 right-3 z-10 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg max-w-xs border border-slate-700 pointer-events-none animate-fadeIn">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                hoveredNode.type === 'concept'
                  ? 'bg-amber-400'
                  : hoveredNode.type === 'orphan'
                  ? 'bg-slate-400'
                  : 'bg-emerald-400'
              }`}
            />
            {hoveredNode.title}
          </div>
          <p className="text-slate-400 mt-0.5">
            Tipo: {hoveredNode.type === 'note' ? 'Nota Criada' : hoveredNode.type === 'concept' ? 'Conceito Vinculado' : 'Nota Isola'}
          </p>
          <p className="text-slate-400">Conexões: {Math.round(hoveredNode.val)}</p>
          <p className="text-slate-400 mt-1 italic text-[11px]">Clique para visualizar ou criar</p>
        </div>
      )}

      {/* SVG Canvas */}
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
