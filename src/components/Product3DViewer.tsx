import React, { useState, useRef } from 'react';
import { RotateCw, ZoomIn, ZoomOut, Eye, Layers, Compass, Sparkles, Info } from 'lucide-react';
import { Product } from '../types';

interface Product3DViewerProps {
  product: Product;
}

export const Product3DViewer: React.FC<Product3DViewerProps> = ({ product }) => {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - startX;
    setRotation((prev) => (prev + delta * 0.5) % 360);
    setStartX(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const delta = e.touches[0].clientX - startX;
    setRotation((prev) => (prev + delta * 0.5) % 360);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setRotation(0);
    setZoom(1);
    setActiveHotspot(null);
  };

  // 3D Hotspots customized for products
  const hotspots = [
    {
      id: 'h1',
      title: 'Precision Acoustic Drivers',
      desc: 'High-density neodymium magnet core offering 40kHz studio frequency fidelity.',
      x: '35%',
      y: '30%',
    },
    {
      id: 'h2',
      title: 'Aerospace Alloy Frame',
      desc: 'Lightweight reinforced chassis built for ergonomic durability and temperature resistance.',
      x: '65%',
      y: '45%',
    },
    {
      id: 'h3',
      title: 'Ultra-Fast USB-C & Battery',
      desc: 'Smart thermal management circuit with 15-minute quick charge delivering 5 hours playtime.',
      x: '50%',
      y: '70%',
    },
  ];

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full h-[460px] rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing select-none transition-colors duration-500 border ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/60 border-slate-800 text-white'
          : 'bg-gradient-to-br from-slate-100 via-white to-slate-200 border-slate-300 text-slate-900'
      }`}
    >
      {/* 3D Grid & Background Horizon */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs font-semibold">
          <Compass className="w-3.5 h-3.5 text-indigo-400 animate-spin [animation-duration:10s]" />
          <span>Interactive 360° Studio</span>
          <span className="text-[10px] text-indigo-300 font-mono">({Math.round(rotation)}°)</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            className="px-2.5 py-1 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-medium transition"
            title="Toggle Showroom Lighting"
          >
            {theme === 'dark' ? '☀️ Showroom' : '🌙 Dark Studio'}
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.2, 1.8))}
            className="p-1.5 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.2, 0.6))}
            className="p-1.5 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white transition"
            title="Reset Angle"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D Rotating Product Canvas */}
      <div className="relative w-full h-full flex items-center justify-center p-8">
        <div
          className="relative transition-transform ease-out duration-75 flex items-center justify-center"
          style={{
            transform: `perspective(1000px) rotateY(${rotation}deg) scale(${zoom})`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Main Product Image with 3D drop shadow */}
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
            alt={product.name}
            draggable={false}
            className="max-h-[300px] w-auto object-contain filter drop-shadow-[0_25px_25px_rgba(0,0,0,0.45)] pointer-events-none"
          />

          {/* 3D Hotspot Nodes */}
          {hotspots.map((hs) => (
            <div
              key={hs.id}
              className="absolute z-30"
              style={{
                top: hs.y,
                left: hs.x,
                transform: `rotateY(${-rotation}deg)`, // Keep hotspot facing the screen
              }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveHotspot(activeHotspot === hs.id ? null : hs.id);
                }}
                className="relative flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white shadow-lg hover:scale-125 transition-transform"
              >
                <span className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-75" />
                <Sparkles className="w-3 h-3 relative z-10" />
              </button>

              {/* Hotspot Tooltip */}
              {activeHotspot === hs.id && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 w-56 p-3 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-indigo-500/30 text-white shadow-2xl text-left animate-in fade-in zoom-in-95"
                >
                  <p className="font-bold text-xs text-indigo-400 leading-tight mb-1">{hs.title}</p>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{hs.desc}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-xs text-[10px] text-slate-300">
        <RotateCw className="w-3 h-3 text-indigo-400" />
        <span>Click & drag horizontally to rotate in 3D • Tap hot-spots for specs</span>
      </div>
    </div>
  );
};
