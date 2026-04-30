import { useEffect, useRef } from 'react';

export default function BlackHole() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 400;

    // Initialize particles
    const particles = [];
    for (let i = 0; i < 200; i++) {
      particles.push({
        radius: Math.random() * 3 + 1,
        angle: Math.random() * Math.PI * 2,
        distance: Math.random() * 180 + 20,
        speed: 0.002 + Math.random() * 0.005,
        life: Math.random(),
      });
    }
    particlesRef.current = particles;

    let time = 0;
    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Outer glow
      const gradient = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, 200);
      gradient.addColorStop(0, '#ffaa00');
      gradient.addColorStop(0.3, '#ff4400');
      gradient.addColorStop(0.6, '#880022');
      gradient.addColorStop(1, '#000000');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 190, 0, Math.PI * 2);
      ctx.fill();

      // Black core
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
      ctx.fill();

      // Particles
      for (let p of particlesRef.current) {
        const dist = p.distance + Math.sin(time * 0.5 + p.angle) * 5;
        const x = centerX + Math.cos(p.angle + time * p.speed * 10) * dist;
        const y = centerY + Math.sin(p.angle + time * p.speed * 10) * dist;
        const alpha = (1 - p.life) * 0.8;
        ctx.fillStyle = `rgba(255, 150, 50, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, p.radius * (0.5 + Math.sin(time * 2) * 0.2), 0, Math.PI * 2);
        ctx.fill();
      }

      // Ripple
      ctx.beginPath();
      ctx.arc(centerX, centerY, 75 + Math.sin(time * 0.01) * 3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 100, 0, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      time += 0.05;
      animationRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
      <canvas ref={canvasRef} width={400} height={400} className="rounded-full shadow-2xl" />
    </div>
  );
}