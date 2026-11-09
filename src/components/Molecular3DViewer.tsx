import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Conformer3D } from '../types/chemistry';
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Box,
  Layers,
  Circle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { CPK_COLORS } from '../utils/cheminformatics';

interface Molecular3DViewerProps {
  conformer?: Conformer3D;
  moleculeName?: string;
  className?: string;
  height?: string;
}

export type RepresentationStyle = 'ballAndStick' | 'stick' | 'spaceFilling' | 'wireframe';

export const Molecular3DViewer: React.FC<Molecular3DViewerProps> = ({
  conformer,
  moleculeName = 'Molecule',
  className = '',
  height = '380px',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasFallbackRef = useRef<HTMLCanvasElement | null>(null);
  const viewer3DRef = useRef<any>(null);

  const [style, setStyle] = useState<RepresentationStyle>('ballAndStick');
  const [isSpinning, setIsSpinning] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredAtomInfo, setHoveredAtomInfo] = useState<string | null>(null);
  const [using3Dmol, setUsing3Dmol] = useState(false);

  // Apply representation style to 3Dmol viewer
  const apply3DmolStyle = useCallback(
    (viewer: any, repStyle: RepresentationStyle) => {
      if (!viewer) return;
      viewer.removeAllSurfaces();

      if (repStyle === 'ballAndStick') {
        viewer.setStyle(
          {},
          {
            stick: { radius: 0.14, colorscheme: 'Jmol' },
            sphere: { scale: 0.28, colorscheme: 'Jmol' },
          }
        );
      } else if (repStyle === 'stick') {
        viewer.setStyle(
          {},
          {
            stick: { radius: 0.2, colorscheme: 'Jmol' },
          }
        );
      } else if (repStyle === 'spaceFilling') {
        viewer.setStyle(
          {},
          {
            sphere: { scale: 0.95, colorscheme: 'Jmol' },
          }
        );
      } else if (repStyle === 'wireframe') {
        viewer.setStyle(
          {},
          {
            line: { linewidth: 2.5, colorscheme: 'Jmol' },
          }
        );
      }

      viewer.render();
    },
    []
  );

  // Initialize or update 3Dmol viewer
  useEffect(() => {
    if (!containerRef.current || !conformer) return;

    const w3d = (window as any).$3Dmol;
    if (w3d && containerRef.current) {
      try {
        containerRef.current.innerHTML = '';
        const viewer = w3d.createViewer(containerRef.current, {
          backgroundColor: '#070b1e',
          id: 'viewer_3dmol',
        });

        viewer3DRef.current = viewer;
        setUsing3Dmol(true);

        // Load SDF
        const sdf = conformer.sdfData;
        if (sdf) {
          viewer.addModel(sdf, 'sdf');
          apply3DmolStyle(viewer, style);
          viewer.zoomTo();
          if (isSpinning) {
            viewer.spin('y', 0.8);
          }
          viewer.render();

          // Set atom hover interaction
          viewer.setHoverable(
            {},
            true,
            (atom: any) => {
              if (atom) {
                setHoveredAtomInfo(
                  `${atom.elem} [idx: ${atom.index + 1}, x:${atom.x.toFixed(2)}, y:${atom.y.toFixed(2)}, z:${atom.z.toFixed(2)}]`
                );
              }
            },
            () => {
              setHoveredAtomInfo(null);
            }
          );
        }
        return;
      } catch (err) {
        console.warn('3Dmol initialization fallback to WebGL canvas:', err);
      }
    }

    // Fallback: WebGL / 2.5D Canvas conformer renderer
    setUsing3Dmol(false);
  }, [conformer, apply3DmolStyle]);

  // Update style when selection changes
  useEffect(() => {
    if (viewer3DRef.current && using3Dmol) {
      apply3DmolStyle(viewer3DRef.current, style);
    }
  }, [style, using3Dmol, apply3DmolStyle]);

  // Update spin
  useEffect(() => {
    if (viewer3DRef.current && using3Dmol) {
      if (isSpinning) {
        viewer3DRef.current.spin('y', 0.8);
      } else {
        viewer3DRef.current.spin(false);
      }
    }
  }, [isSpinning, using3Dmol]);

  // Fallback 3D Canvas rendering loop when 3Dmol is not yet loaded
  useEffect(() => {
    if (using3Dmol || !conformer || !canvasFallbackRef.current) return;

    const canvas = canvasFallbackRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let rotX = 0.2;
    let rotY = 0;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let zoom = 40;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      rotY += dx * 0.01;
      rotX += dy * 0.01;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };
    const onMouseUp = () => {
      isDragging = false;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoom = Math.max(15, Math.min(90, zoom - e.deltaY * 0.05));
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel);

    const render = () => {
      if (isSpinning && !isDragging) {
        rotY += 0.012;
      }

      const w = (canvas.width = canvas.parentElement?.clientWidth || 400);
      const h = (canvas.height = canvas.parentElement?.clientHeight || 300);

      ctx.fillStyle = '#070b1e';
      ctx.fillRect(0, 0, w, h);

      // Rotate 3D points
      const projected = conformer.atoms.map((a, i) => {
        // Rotate around Y
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const x1 = a.x * cosY + a.z * sinY;
        const z1 = -a.x * sinY + a.z * cosY;

        // Rotate around X
        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const y2 = a.y * cosX - z1 * sinX;
        const z2 = a.y * sinX + z1 * cosX;

        // Projection
        const px = w / 2 + x1 * zoom;
        const py = h / 2 + y2 * zoom;

        return { x: px, y: py, z: z2, elem: a.elem, idx: i };
      });

      // Sort by depth (painter's algorithm)
      const sorted = [...projected].sort((a, b) => a.z - b.z);

      // Draw bonds
      ctx.lineWidth = style === 'wireframe' ? 1.5 : style === 'stick' ? 4 : 2.5;
      for (const b of conformer.bonds) {
        const p1 = projected[b.atom1];
        const p2 = projected[b.atom2];
        if (!p1 || !p2) continue;

        ctx.strokeStyle = style === 'wireframe' ? '#38bdf8' : '#475569';
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Draw atoms
      for (const p of sorted) {
        const color = CPK_COLORS[p.elem] || CPK_COLORS.Default;
        let radius = 6;
        if (style === 'spaceFilling') radius = 16;
        else if (style === 'ballAndStick') radius = 7;
        else if (style === 'stick') radius = 3;
        else if (style === 'wireframe') radius = 2;

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = style === 'ballAndStick' ? 5 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [using3Dmol, conformer, isSpinning, style]);

  const handleResetCamera = () => {
    if (viewer3DRef.current && using3Dmol) {
      viewer3DRef.current.zoomTo();
      viewer3DRef.current.render();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`relative flex flex-col rounded-xl overflow-hidden bg-[#070b1e] border border-cyan-500/25 transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''
      } ${className}`}
      style={{ height: isFullscreen ? 'calc(100vh - 2rem)' : height }}
    >
      {/* 3D Viewer Header Controls */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-cyan-500/20 bg-slate-900/80 backdrop-blur-md z-10">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono font-medium text-cyan-300">
            3D Molecular Conformer
          </span>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
            {conformer?.atoms.length || 0} Atoms
          </span>
        </div>

        {/* Representation Selector */}
        <div className="flex items-center space-x-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setStyle('ballAndStick')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
              style === 'ballAndStick'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Ball and Stick"
          >
            Ball & Stick
          </button>
          <button
            onClick={() => setStyle('stick')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
              style === 'stick'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Stick"
          >
            Stick
          </button>
          <button
            onClick={() => setStyle('spaceFilling')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
              style === 'spaceFilling'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Space Filling (van der Waals)"
          >
            Space-Filling
          </button>
          <button
            onClick={() => setStyle('wireframe')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
              style === 'wireframe'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Wireframe"
          >
            Wireframe
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsSpinning(!isSpinning)}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              isSpinning
                ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-400'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title={isSpinning ? 'Pause Auto-Spin' : 'Start Auto-Spin'}
            aria-label={isSpinning ? 'Pause Auto-Spin' : 'Start Auto-Spin'}
          >
            {isSpinning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleResetCamera}
            className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-cyan-300 transition-colors"
            title="Reset Camera Orientation"
            aria-label="Reset Camera Orientation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-cyan-300 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 3D Canvas Surface */}
      <div className="relative flex-1 w-full h-full min-h-[220px] overflow-hidden">
        {/* 3Dmol container */}
        <div
          ref={containerRef}
          className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing"
          style={{ display: using3Dmol ? 'block' : 'none' }}
        />

        {/* Fallback canvas */}
        {!using3Dmol && (
          <canvas
            ref={canvasFallbackRef}
            className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing"
          />
        )}

        {/* Hover Information Badge */}
        {hoveredAtomInfo && (
          <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded bg-slate-950/90 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 shadow-lg pointer-events-none">
            {hoveredAtomInfo}
          </div>
        )}

        {/* Quick controls hint in corner */}
        <div className="absolute bottom-2 right-2 z-10 flex items-center space-x-1.5 px-2 py-0.5 rounded bg-slate-950/70 border border-slate-800 text-[10px] font-mono text-slate-400 pointer-events-none">
          <span>Rotate: Left Click + Drag</span>
          <span>•</span>
          <span>Zoom: Scroll</span>
          <span>•</span>
          <span>Pan: Right Click</span>
        </div>
      </div>
    </div>
  );
};
