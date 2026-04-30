import { useState, useEffect, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { getRelativeTime } from '../utils/ageColor';
import { getPlanetStyle } from '../utils/planetStyles';
import { Trash2, Clock } from 'lucide-react';

export default function TaskItem({ task, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [showAge, setShowAge] = useState(false);
  const [localStage, setLocalStage] = useState(task.stage || 'planet');
  const [localSize, setLocalSize] = useState(task.size || 1);
  const [particles, setParticles] = useState([]);
  const animationRef = useRef();

  const planetStyle = getPlanetStyle(task.planetType || 0);

  // Time-based expansion and black hole transition
  useEffect(() => {
    const created = new Date(task.createdAt);
    const updateStage = () => {
      const now = new Date();
      const ageMinutes = (now - created) / (1000 * 60);
      
      // For testing: scale times (1 min = 1 hour in real world)
      // Adjust as needed: expansion starts at 2 min, black hole at 5 min
      if (ageMinutes < 2) {
        // Growing planet
        const newSize = 1 + (ageMinutes / 2) * 2; // max size 3 at 2 min
        setLocalSize(Math.min(3, newSize));
        if (localStage !== 'planet') setLocalStage('planet');
      } else if (ageMinutes >= 2 && ageMinutes < 5) {
        // Planet becomes unstable, starts glowing
        const growth = 3 + (ageMinutes - 2) * 1.5;
        setLocalSize(Math.min(6, growth));
        setLocalStage('expanding');
      } else if (ageMinutes >= 5) {
        // Transform into black hole
        if (localStage !== 'blackhole') {
          setLocalStage('blackhole');
          setLocalSize(2.5); // black hole size
          // Generate particles for black hole
          const newParticles = [];
          for (let i = 0; i < 50; i++) {
            newParticles.push({
              angle: Math.random() * Math.PI * 2,
              radius: Math.random() * 80,
              speed: 0.02 + Math.random() * 0.03,
              life: 1,
            });
          }
          setParticles(newParticles);
        } else {
          // Animate particles when black hole
          setParticles(prev => prev.map(p => ({
            ...p,
            radius: p.radius + p.speed * 2,
            life: p.life - 0.01,
          })).filter(p => p.life > 0));
        }
      }
    };

    updateStage();
    const interval = setInterval(updateStage, 1000);
    return () => clearInterval(interval);
  }, [task.createdAt, localStage]);

  // Particle animation for black holes
  useEffect(() => {
    if (localStage === 'blackhole') {
      const animate = () => {
        setParticles(prev => prev.map(p => ({
          ...p,
          radius: p.radius + p.speed,
          life: p.life - 0.005,
        })).filter(p => p.life > 0));
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationRef.current);
    }
  }, [localStage]);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: task,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    position: 'absolute',
    left: task.x,
    top: task.y,
    zIndex: 10,
    cursor: 'grab',
  };

  const handleSaveEdit = async () => {
    if (editTitle.trim()) {
      await onUpdate(task.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  // Render planet with 3D effect
  const renderPlanet = () => {
    const sizePx = 60 + localSize * 20;
    const styleObj = {
      width: `${sizePx}px`,
      height: `${sizePx}px`,
      borderRadius: '50%',
      background: planetStyle.gradient,
      boxShadow: `0 0 20px ${planetStyle.atmosphere}, inset -10px -10px 20px rgba(0,0,0,0.5), inset 10px 10px 20px rgba(255,255,255,0.2)`,
      position: 'relative',
      transition: 'all 0.3s ease',
    };

    // Add patterns
    let patternElement = null;
    if (planetStyle.pattern === 1) { // stripes
      patternElement = <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `repeating-linear-gradient(45deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 10px, transparent 10px, transparent 20px)` }} />;
    } else if (planetStyle.pattern === 2) { // spots
      patternElement = <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle at 30% 40%, rgba(0,0,0,0.3) 5%, transparent 15%), radial-gradient(circle at 70% 60%, rgba(0,0,0,0.3) 8%, transparent 18%)` }} />;
    } else if (planetStyle.pattern === 3) { // swirl
      patternElement = <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `conic-gradient(from 0deg, rgba(0,0,0,0.2) 0deg, transparent 60deg, rgba(0,0,0,0.2) 120deg)` }} />;
    }

    // Rings if applicable
    let ring = null;
    if (planetStyle.ring && localStage !== 'blackhole') {
      ring = <div style={{ position: 'absolute', top: '50%', left: '50%', width: `${sizePx * 1.5}px`, height: `${sizePx * 0.4}px`, transform: 'translate(-50%, -50%) rotate(-20deg)', borderRadius: '50%', border: `3px solid rgba(200,180,100,0.6)`, borderTopColor: 'transparent', borderBottomColor: 'transparent', pointerEvents: 'none' }} />;
    }

    return (
      <div style={styleObj}>
        {patternElement}
        {ring}
      </div>
    );
  };

  // Render black hole with particles
 const renderBlackHole = () => {
  const sizePx = 80;
  return (
    <div style={{ position: 'relative', width: `${sizePx}px`, height: `${sizePx}px` }}>
      <div style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%, #000, #111, #330000)',
        boxShadow: '0 0 30px rgba(255,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.2)',
        animation: 'pulse 1s infinite alternate',
      }} />
      {particles.map((p, idx) => (
        <div key={idx} style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: `rgba(255, ${100 + Math.random() * 155}, 50, ${p.life})`,
          transform: `translate(-50%, -50%) rotate(${p.angle}rad) translate(${p.radius}px, 0)`,
        }} />
      ))}
    </div>
  );
};

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="transition-all duration-200"
      onMouseEnter={() => setShowAge(true)}
      onMouseLeave={() => setShowAge(false)}
    >
      <div
        className="flex flex-col items-center"
        {...listeners}
        {...attributes}
      >
        {localStage === 'blackhole' ? renderBlackHole() : renderPlanet()}
        
        <div className="mt-2 bg-black/50 backdrop-blur-sm rounded-lg p-1 text-center max-w-[120px]">
          {isEditing ? (
            <div className="flex gap-1">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="bg-gray-800 text-white px-1 py-0.5 rounded text-xs w-20"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
              />
              <button onClick={handleSaveEdit} className="text-green-300 text-xs">✓</button>
              <button onClick={() => setIsEditing(false)} className="text-red-300 text-xs">✗</button>
            </div>
          ) : (
            <>
              <span
                className="text-white text-xs font-bold cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                {task.title}
              </span>
              <button
                onClick={() => onDelete(task.id)}
                className="ml-1 text-white/60 hover:text-white"
              >
                <Trash2 size={12} />
              </button>
            </>
          )}
          {showAge && (
            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-300 mt-1">
              <Clock size={10} /> {getRelativeTime(task.createdAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}