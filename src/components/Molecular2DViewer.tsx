import React, { useMemo, useState } from 'react';
import { parseSmiles, generate2DCoordinates } from '../utils/cheminformatics';
import { Download, Copy, Check, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

interface Molecular2DViewerProps {
  smiles: string;
  name?: string;
  className?: string;
  showControls?: boolean;
}

export const Molecular2DViewer: React.FC<Molecular2DViewerProps> = ({
  smiles,
  name,
  className = '',
  showControls = true,
}) => {
  const [scale, setScale] = useState(1);
  const [copied, setCopied] = useState(false);
  const [hoveredAtom, setHoveredAtom] = useState<{ symbol: string; idx: number } | null>(null);

  const layout = useMemo(() => {
    try {
      const parsed = parseSmiles(smiles);
      return generate2DCoordinates(parsed);
    } catch {
      return null;
    }
  }, [smiles]);

  const handleCopySvg = () => {
    if (!layout?.svg) return;
    navigator.clipboard.writeText(layout.svg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    if (!layout?.svg) return;
    const blob = new Blob([layout.svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(name || 'molecule').toLowerCase().replace(/\s+/g, '_')}_2d.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!layout) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-400 ${className}`}>
        <p className="text-sm font-mono text-rose-400">Failed to render 2D molecular structure</p>
        <p className="text-xs text-slate-500 mt-1">Check SMILES notation</p>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col rounded-xl overflow-hidden bg-[#090e23]/90 border border-cyan-500/20 group ${className}`}>
      {/* Top Header & Actions */}
      {showControls && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-cyan-500/15 bg-slate-900/60 z-10">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-medium text-cyan-400">2D Topology</span>
            {hoveredAtom && (
              <span className="text-[11px] font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                Atom #{hoveredAtom.idx + 1}: {hoveredAtom.symbol}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setScale((s) => Math.min(2, s + 0.15))}
              className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800/70 transition-colors"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setScale((s) => Math.max(0.6, s - 0.15))}
              className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800/70 transition-colors"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setScale(1)}
              className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800/70 transition-colors"
              title="Reset Zoom"
              aria-label="Reset Zoom"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-3 bg-slate-700 mx-1" />
            <button
              onClick={handleCopySvg}
              className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800/70 transition-colors"
              title="Copy SVG"
              aria-label="Copy SVG"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleDownloadSvg}
              className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800/70 transition-colors"
              title="Download SVG"
              aria-label="Download SVG"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2D Canvas Container with Subgrid */}
      <div
        className="relative flex-1 flex items-center justify-center p-4 min-h-[200px] overflow-hidden"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(6, 182, 212, 0.08) 1px, transparent 0)`,
          backgroundSize: '20px 20px',
        }}
      >
        <div
          className="transition-transform duration-200 ease-out flex items-center justify-center w-full h-full max-h-[360px]"
          style={{ transform: `scale(${scale})` }}
          dangerouslySetInnerHTML={{ __html: layout.svg }}
        />
      </div>
    </div>
  );
};
