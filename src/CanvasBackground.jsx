import React, { useEffect, useRef } from 'react';

export default function CanvasBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const nodeCount = Math.min(Math.floor((width * height) / 19000), 75);
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      baseRadius: Math.random() * 2 + 0.8,
      glow: Math.random() * Math.PI,
      hue: Math.random() > 0.6 ? 45 : Math.random() > 0.3 ? 275 : 190
    }));

    let mouse = { x: -2000, y: -2000, targetX: -2000, targetY: -2000, active: false };
    let embers = [];

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;

      for (let i = 0; i < 2; i++) {
        embers.push({
          x: e.clientX + (Math.random() - 0.5) * 12,
          y: e.clientY + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 0.3,
          radius: Math.random() * 2.2 + 0.8,
          alpha: 0.95,
          decay: Math.random() * 0.035 + 0.02,
          color: Math.random() > 0.5 ? '#fcd34d' : '#c084fc'
        });
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      mouse.x += (mouse.targetX - mouse.x) * 0.16;
      mouse.y += (mouse.targetY - mouse.y) * 0.16;

      if (mouse.active) {
        const radGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 160);
        radGlow.addColorStop(0, 'rgba(251, 191, 36, 0.08)');
        radGlow.addColorStop(0.5, 'rgba(192, 132, 252, 0.04)');
        radGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = radGlow;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 160, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distSq = dx * dx + dy * dy;

          if (distSq < 14400) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / 120) * 0.18;
            ctx.strokeStyle = `rgba(251, 191, 36, ${alpha})`;
            ctx.lineWidth = 0.65;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        node.glow += 0.03;

        if (node.x < 0) node.x = width;
        if (node.x > width) node.x = 0;
        if (node.y < 0) node.y = height;
        if (node.y > height) node.y = 0;

        if (mouse.active) {
          const mdx = node.x - mouse.x;
          const mdy = node.y - mouse.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mDist < 140 && mDist > 0) {
            const force = (140 - mDist) / 140;
            node.x += (mdx / mDist) * force * 1.8;
            node.y += (mdy / mDist) * force * 1.8;
          }
        }

        const pulseAlpha = Math.abs(Math.sin(node.glow)) * 0.5 + 0.35;
        const radius = node.baseRadius + Math.sin(node.glow) * 0.4;

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${node.hue}, 95%, 70%, ${pulseAlpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `hsla(${node.hue}, 95%, 65%, 0.8)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      for (let i = embers.length - 1; i >= 0; i--) {
        const s = embers[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= s.decay;

        if (s.alpha <= 0) {
          embers.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = s.color;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
