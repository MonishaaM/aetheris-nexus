import React, { useRef, useEffect, useState } from 'react';
import { X, Clock, Zap, Activity, Radio, ShieldCheck, Crosshair } from 'lucide-react';

export default function QuantumCoreVisualizer({ posts = [], onSelectPost, onClose }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    let frameId;

    const resize = () => {
      canvas.width = container.clientWidth || 900;
      canvas.height = container.clientHeight || 550;
    };
    resize();
    window.addEventListener('resize', resize);

    // Guaranteed vibrant nodes even if catalog is new
    const sampleNodes = [
      { id: 's1', title: 'Zero-Day Vulnerability Research', category: 'Cybersecurity', author_name: 'CipherMind' },
      { id: 's2', title: 'Why Honey Survives Millennia', category: 'Cool Facts', author_name: 'Aetheris' },
      { id: 's3', title: 'Daily Zen & Evening Sunset Stroll', category: 'Daily Life', author_name: 'Solace' },
      { id: 's4', title: 'Building 60FPS Reactive Canvases', category: 'Technology', author_name: 'ByteCraft' },
      { id: 's5', title: 'The Two-Minute Rule of Flow', category: 'Life Hacks', author_name: 'NovaSeeker' },
      { id: 's6', title: 'Decentralized Cryptographic Ledger', category: 'Cybersecurity', author_name: 'OrionPrime' }
    ];

    const displayList = posts.length > 0 ? posts : sampleNodes;

    // Node geometry mapping
    const orbitNodes = displayList.map((post, idx) => {
      const ringTier = (idx % 3) + 1;
      const radius = 100 + ringTier * 75;
      const baseAngle = (idx * (Math.PI * 2)) / displayList.length;
      const speed = 0.007 + (idx % 3) * 0.0025;
      
      let hue = 45; // Electric Amber
      if (post.category === 'Technology' || post.category === 'Web Engineering') hue = 275; // Neon Violet
      if (post.category === 'Cybersecurity') hue = 195; // Cyan Plasma
      if (post.category === 'Life Hacks' || post.category === 'Cool Facts') hue = 155; // Emerald Laser

      return {
        ...post,
        radius,
        baseAngle,
        speed,
        hue,
        currentX: 0,
        currentY: 0,
        size: 8 + (idx % 3) * 2
      };
    });

    // 120 kinetic background flux embers spiraling through the field
    const cosmicSwarm = Array.from({ length: 110 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: Math.random() * 380 + 30,
      speed: (Math.random() * 0.006 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
      radialDrift: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 0.6,
      alpha: Math.random() * 0.8 + 0.2,
      color: Math.random() > 0.6 ? '#fcd34d' : Math.random() > 0.3 ? '#c084fc' : '#38bdf8'
    }));

    // Expanding shockwaves from singularity core
    let shockwaves = [
      { r: 20, alpha: 0.9, speed: 1.8 },
      { r: 90, alpha: 0.6, speed: 1.8 },
      { r: 160, alpha: 0.3, speed: 1.8 }
    ];

    let angle = 0;
    let tiltX = 0;
    let tiltY = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Mouse Parallax Tilt
      const targetTiltX = ((mousePos.x - centerX) / width) * 22;
      const targetTiltY = ((mousePos.y - centerY) / height) * 18;
      tiltX += (targetTiltX - tiltX) * 0.08;
      tiltY += (targetTiltY - tiltY) * 0.08;

      angle += 0.008;

      // 1. Draw Space-Time Grid Warp
      ctx.save();
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.035)';
      ctx.lineWidth = 1;
      const gridSize = 45;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Cosmic Swarm Particles
      cosmicSwarm.forEach((p) => {
        p.angle += p.speed;
        p.dist += p.radialDrift;
        if (p.dist < 25) p.dist = 360;
        if (p.dist > 380) p.dist = 30;

        const px = centerX + Math.cos(p.angle) * p.dist + tiltX * 0.6;
        const py = centerY + Math.sin(p.angle) * (p.dist * 0.48) + tiltY * 0.6;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // 3. Shockwave Pulses Radiating Outwards
      shockwaves.forEach((sw) => {
        sw.r += sw.speed;
        sw.alpha -= 0.004;
        if (sw.r > 380 || sw.alpha <= 0) {
          sw.r = 20;
          sw.alpha = 0.85;
        }

        ctx.beginPath();
        ctx.ellipse(centerX + tiltX, centerY + tiltY, sw.r, sw.r * 0.46, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(251, 191, 36, ${sw.alpha * 0.35})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // 4. Multi-Axis Dynamic Orbital Laser Belts
      const rings = [
        { r: 160, tilt: 0.44, rot: angle * 1.2, color: 'rgba(251, 191, 36, 0.4)', dash: [14, 18], tracerHue: '#fbbf24' },
        { r: 235, tilt: 0.48, rot: -angle * 0.9 + 1, color: 'rgba(192, 132, 252, 0.4)', dash: [8, 14], tracerHue: '#c084fc' },
        { r: 310, tilt: 0.42, rot: angle * 0.7 + 2.2, color: 'rgba(56, 189, 248, 0.35)', dash: [16, 20], tracerHue: '#38bdf8' }
      ];

      rings.forEach((ring, idx) => {
        ctx.save();
        ctx.translate(centerX + tiltX, centerY + tiltY);
        ctx.rotate(ring.rot);

        // Halo Ring Track
        ctx.beginPath();
        ctx.ellipse(0, 0, ring.r, ring.r * ring.tilt, 0, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 1.6;
        ctx.setLineDash(ring.dash);
        ctx.stroke();

        // High-Speed Photon Energy Tracers
        for (let i = 0; i < 2; i++) {
          const tracerAngle = (angle * 3.5 + i * Math.PI) % (Math.PI * 2);
          const tx = Math.cos(tracerAngle) * ring.r;
          const ty = Math.sin(tracerAngle) * (ring.r * ring.tilt);

          ctx.beginPath();
          ctx.arc(tx, ty, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = ring.tracerHue;
          ctx.shadowBlur = 18;
          ctx.shadowColor = ring.tracerHue;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        ctx.restore();
      });

      // 5. High-Energy Singularity Core
      const corePulse = Math.sin(angle * 4.5) * 5;
      const coreGrad = ctx.createRadialGradient(
        centerX + tiltX, centerY + tiltY, 0,
        centerX + tiltX, centerY + tiltY, 52 + corePulse
      );
      coreGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      coreGrad.addColorStop(0.25, 'rgba(251, 191, 36, 0.95)');
      coreGrad.addColorStop(0.55, 'rgba(192, 132, 252, 0.6)');
      coreGrad.addColorStop(0.85, 'rgba(56, 189, 248, 0.25)');
      coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(centerX + tiltX, centerY + tiltY, 52 + corePulse, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.shadowBlur = 35;
      ctx.shadowColor = '#fbbf24';
      ctx.fill();
      ctx.shadowBlur = 0;

      // 6. Draw Orbit Nodes, Laser Beams, & HUD Brackets
      let activeFound = null;

      orbitNodes.forEach((node) => {
        const curAngle = angle * (node.speed / 0.007) + node.baseAngle;
        const nx = centerX + Math.cos(curAngle) * node.radius + tiltX;
        const ny = centerY + Math.sin(curAngle) * (node.radius * 0.46) + tiltY;

        node.currentX = nx;
        node.currentY = ny;

        const dx = mousePos.x - nx;
        const dy = mousePos.y - ny;
        const isHovered = Math.sqrt(dx * dx + dy * dy) < node.size + 15;
        if (isHovered) {
          activeFound = node;
        }

        // Kinetic Laser Filament
        ctx.beginPath();
        ctx.moveTo(centerX + tiltX, centerY + tiltY);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = isHovered 
          ? `hsla(${node.hue}, 100%, 70%, 0.85)` 
          : `rgba(251, 191, 36, 0.16)`;
        ctx.lineWidth = isHovered ? 2.5 : 1;
        ctx.stroke();

        // Node Radiant Flare Body
        ctx.beginPath();
        ctx.arc(nx, ny, isHovered ? node.size + 5 : node.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${node.hue}, 100%, 65%, 1)`;
        ctx.shadowBlur = isHovered ? 35 : 16;
        ctx.shadowColor = `hsla(${node.hue}, 100%, 60%, 1)`;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Glowing Core Specular
        ctx.beginPath();
        ctx.arc(nx, ny, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Outer Resonance Ring
        ctx.beginPath();
        ctx.arc(nx, ny, node.size + 7, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${node.hue}, 95%, 75%, ${isHovered ? 0.95 : 0.4})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // Sci-Fi Reticle Brackets on Hover
        if (isHovered) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.6;
          const bSize = node.size + 12;
          // Top-Left [
          ctx.beginPath();
          ctx.moveTo(nx - bSize, ny - bSize + 6);
          ctx.lineTo(nx - bSize, ny - bSize);
          ctx.lineTo(nx - bSize + 6, ny - bSize);
          // Bottom-Right ]
          ctx.moveTo(nx + bSize, ny + bSize - 6);
          ctx.lineTo(nx + bSize, ny + bSize);
          ctx.lineTo(nx + bSize - 6, ny + bSize);
          ctx.stroke();
        }

        // Title Tag & Category Hologram
        ctx.font = isHovered ? 'bold 13px "Cinzel", serif' : '11px "Plus Jakarta Sans", monospace';
        ctx.fillStyle = isHovered ? '#fef08a' : 'rgba(241, 245, 249, 0.9)';
        const label = node.title.length > 22 ? node.title.slice(0, 20) + '...' : node.title;
        ctx.fillText(label, nx + node.size + 11, ny + 4);
      });

      setHoveredNode(activeFound);
      frameId = requestAnimationFrame(render);
    };

    render();

    const handleCanvasMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    const handleCanvasClick = () => {
      if (hoveredNode && onSelectPost) {
        onSelectPost(hoveredNode.id);
      }
    };

    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('click', handleCanvasClick);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleCanvasMouseMove);
      canvas.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(frameId);
    };
  }, [posts, mousePos.x, mousePos.y, hoveredNode, onSelectPost]);

  return (
    <div className="fixed inset-0 z-50 bg-[#040209]/95 backdrop-blur-2xl flex flex-col justify-between p-6 animate-fadeIn">
      {/* Top Cockpit Header */}
      <div className="flex items-center justify-between border-b border-amber-500/25 pb-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-400/50 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(192,132,252,0.3)]">
            <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <span className="text-xl md:text-2xl font-cinzel font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 flex items-center gap-2">
              QUANTUM KNOWLEDGE MATRIX
            </span>
            <p className="text-xs font-mono text-amber-300/70 mt-0.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              Live Gravitational Gyroscope &bull; Move mouse to tilt perspective &bull; Click node to open
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl border border-amber-400/40 text-amber-300 hover:bg-amber-400/15 hover:border-amber-300 flex items-center gap-2 text-xs font-mono uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
        >
          <X className="w-4 h-4" /> Close Cockpit
        </button>
      </div>

      {/* Main Interactive Stage */}
      <div 
        ref={containerRef} 
        className="flex-1 relative max-w-7xl mx-auto w-full my-4 flex items-center justify-center overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-b from-[#090514]/90 via-[#040209]/95 to-black min-h-[500px] shadow-[0_0_35px_rgba(245,158,11,0.12)]"
      >
        {/* Ambient Corner Sci-Fi Coordinates */}
        <div className="absolute top-4 left-5 text-[10px] font-mono text-amber-400/60 pointer-events-none space-y-1">
          <div>SYS_CORE: ONLINE [432.8 THz]</div>
          <div>ROTATIONAL_FLUX: ACCELERATED</div>
        </div>
        <div className="absolute top-4 right-5 text-[10px] font-mono text-purple-400/60 pointer-events-none text-right space-y-1">
          <div>PARALLAX_TILT: DYNAMIC</div>
          <div>SINGULARITY_LOCK: 100%</div>
        </div>

        <canvas ref={canvasRef} className="w-full h-full cursor-crosshair block" />

        {/* Hover Telemetry HUD Card */}
        {hoveredNode && (
          <div className="absolute bottom-6 left-6 p-6 rounded-2xl bg-[#090514]/95 border-2 border-amber-400/50 backdrop-blur-2xl shadow-[0_0_35px_rgba(245,158,11,0.3)] max-w-md pointer-events-none animate-fadeIn space-y-2.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 uppercase tracking-wider">
                {hoveredNode.category}
              </span>
              <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                <Crosshair className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} /> TARGET ACQUIRED
              </span>
            </div>

            <h4 className="text-lg font-cinzel font-bold text-white leading-snug">
              {hoveredNode.title}
            </h4>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono text-purple-300">
              <span>Author: <span className="text-amber-200">{hoveredNode.author_name}</span></span>
              <span className="text-amber-400 font-bold flex items-center gap-1">Click to Teleport &rarr;</span>
            </div>
          </div>
        )}
      </div>

      {/* Cockpit HUD Legend */}
      <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between text-xs font-mono text-slate-300 border-t border-amber-500/20 pt-3">
        <div className="flex flex-wrap items-center gap-5">
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24]" /> Daily Life &amp; Trivia</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_10px_#c084fc]" /> Technology &amp; Systems</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#38bdf8]" /> Cybersecurity &amp; CTF</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" /> Life Hacks &amp; Tips</span>
        </div>
        <span className="text-amber-300 font-semibold flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-emerald-400" /> Kinetic Plasma Matrix Synchronized
        </span>
      </div>
    </div>
  );
}
