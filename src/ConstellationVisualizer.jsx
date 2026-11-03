import React, { useRef, useEffect } from 'react';
import { Compass, Sparkles } from 'lucide-react';

export default function ConstellationVisualizer({ posts, onSelectPost }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frameId;

    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = 240);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 240;
    };
    window.addEventListener('resize', handleResize);

    let angle = 0;
    const postNodes = posts.slice(0, 10).map((post, idx) => ({
      ...post,
      orbitRadius: 65 + (idx % 3) * 35,
      speed: 0.008 + (idx % 4) * 0.003,
      angleOffset: (idx * (Math.PI * 2)) / Math.max(posts.length, 1),
      color: idx % 3 === 0 ? '#fbbf24' : idx % 3 === 1 ? '#c084fc' : '#38bdf8'
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const centerX = width / 2;
      const centerY = height / 2;

      // Draw subtle orbital rings
      [65, 100, 135].forEach((radius) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.08)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Center Core Beacon
      ctx.beginPath();
      ctx.arc(centerX, centerY, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#fbbf24';
      ctx.fill();
      ctx.shadowBlur = 0;

      angle += 0.005;

      // Draw Orbiting Article Nodes
      postNodes.forEach((node) => {
        const curAngle = angle * (node.speed / 0.008) + node.angleOffset;
        const x = centerX + Math.cos(curAngle) * node.orbitRadius;
        const y = centerY + Math.sin(curAngle) * (node.orbitRadius * 0.65); // 2.5D Isometric Tilt

        // Link filament to core
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.12)';
        ctx.lineWidth = 0.7;
        ctx.stroke();

        // Node circle
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = node.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Title Pill
        ctx.font = '10px "Plus Jakarta Sans", monospace';
        ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
        const truncated = node.title.length > 18 ? node.title.slice(0, 16) + '...' : node.title;
        ctx.fillText(truncated, x + 8, y + 3);
      });

      frameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
    };
  }, [posts]);

  if (posts.length === 0) return null;

  return (
    <div className="bg-[#090514]/85 backdrop-blur-xl p-5 rounded-2xl stardust-border relative overflow-hidden space-y-2">
      <div className="flex items-center justify-between text-xs font-mono text-amber-300/80">
        <span className="flex items-center gap-1.5 uppercase tracking-widest">
          <Compass className="w-3.5 h-3.5 text-amber-400" /> Kinetic Constellation Knowledge Map
        </span>
        <span className="text-slate-500 text-[11px] flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-purple-400" /> Live Orbit Telemetry
        </span>
      </div>
      <canvas ref={canvasRef} className="w-full rounded-xl cursor-crosshair" />
    </div>
  );
}