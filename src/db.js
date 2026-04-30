import Dexie from 'dexie';

export const db = new Dexie('ChronoBlackholeDB');
db.version(2).stores({
  tasks: '++id, title, createdAt, x, y, planetType, size, stage',
}).upgrade(tx => {
  // Add default fields for existing tasks
  return tx.table('tasks').toCollection().modify(task => {
    if (!task.planetType) task.planetType = Math.floor(Math.random() * 50);
    if (!task.size) task.size = 1;
    if (!task.stage) task.stage = 'planet';
  });
});

export async function getTasks() {
  return await db.tasks.toArray();
}

export async function addTask(title, x, y, planetType) {
  return await db.tasks.add({
    title,
    createdAt: new Date().toISOString(),
    x,
    y,
    planetType: planetType || Math.floor(Math.random() * 50),
    size: 1,
    stage: 'planet',
  });
}

export async function deleteTask(id) {
  await db.tasks.delete(id);
}

export async function updateTask(id, updates) {
  await db.tasks.update(id, updates);
}