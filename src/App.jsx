import { useState, useEffect } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { getTasks, addTask, deleteTask, updateTask } from './db';
import TaskItem from './components/TaskItem';
import BlackHole from './components/BlackHole';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadTasks = async () => {
    try {
      const allTasks = await getTasks();
      setTasks(allTasks);
    } catch (err) {
      console.error('Failed to load tasks', err);
    }
  };

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 1000); // update every second for size/stage changes
    return () => clearInterval(interval);
  }, []);

  // Check if two tasks overlap (within 100px radius)
  const isOverlapping = (x, y, existingTasks, excludeId = null) => {
    return existingTasks.some(t => {
      if (excludeId === t.id) return false;
      const dx = t.x - x;
      const dy = t.y - y;
      const distance = Math.hypot(dx, dy);
      return distance < 110; // planet radius ~60-100px
    });
  };

  const getRandomPosition = (existingTasks, excludeId = null) => {
    const width = viewport.width;
    const height = viewport.height;
    const centerX = width / 2;
    const centerY = height / 2;
    let attempts = 0;
    let x, y;
    do {
      x = Math.random() * (width - 300) + 50;
      y = Math.random() * (height - 300) + 50;
      attempts++;
      if (attempts > 100) break; // fallback
    } while (isOverlapping(x, y, existingTasks, excludeId) || Math.hypot(x - centerX, y - centerY) < 150);
    return { x: Math.max(50, Math.min(width - 150, x)), y: Math.max(50, Math.min(height - 150, y)) };
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const { x, y } = getRandomPosition(tasks);
    await addTask(newTaskTitle.trim(), x, y);
    setNewTaskTitle('');
    loadTasks();
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    loadTasks();
  };

  const handleUpdate = async (id, updates) => {
    await updateTask(id, updates);
    loadTasks();
  };

  const handleDragEnd = async (event) => {
    const { active, delta } = event;
    const task = tasks.find(t => t.id == active.id);
    if (!task) return;

    // Calculate new position
    const newX = (task.x || 100) + delta.x;
    const newY = (task.y || 100) + delta.y;

    // Check if dropped onto black hole center (within 100px of screen center)
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const distanceToCenter = Math.hypot(newX + 50 - centerX, newY + 50 - centerY); // approximate planet center
    if (distanceToCenter < 120) {
      // Delete the task (consumed by black hole)
      await deleteTask(task.id);
      loadTasks();
      return;
    }

    // Prevent overlapping with other tasks
    if (isOverlapping(newX, newY, tasks, task.id)) {
      // Revert to original position
      return;
    }

    await updateTask(task.id, { x: newX, y: newY });
    loadTasks();
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="relative w-full h-screen overflow-hidden">
        {/* Space-like animated gradient */}
        <div className="fixed inset-0 -z-20" style={{
          background: 'radial-gradient(ellipse at center, #0a0a2a 0%, #000010 100%)',
          animation: 'spacePulse 10s infinite alternate',
        }} />
        <div className="fixed inset-0 -z-10 opacity-30" style={{
          backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
        <style>{`
          @keyframes spacePulse {
            0% { opacity: 0.7; }
            100% { opacity: 1; background: radial-gradient(ellipse at center, #15153a 0%, #000018 100%); }
          }
        `}</style>
        
        {/* Black hole with 3D effect */}
        <BlackHole />
        
        {/* Add task form */}
        <form onSubmit={handleAddTask} className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex gap-2 bg-black/60 backdrop-blur-md p-3 rounded-full shadow-xl border border-purple-500/30">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Create a new planet..."
            className="bg-gray-900 text-white rounded-full px-5 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-full font-semibold">
            Add
          </button>
        </form>

        {/* Render tasks */}
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))}
      </div>
    </DndContext>
  );
}

export default App;