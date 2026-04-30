export function getTaskColor(createdAtISO) {
  const created = new Date(createdAtISO);
  const now = new Date();
  const diffMinutes = (now - created) / (1000 * 60);

  if (diffMinutes < 30) return 'bg-blue-500 hover:bg-blue-600';
  if (diffMinutes < 120) return 'bg-purple-500 hover:bg-purple-600';
  if (diffMinutes < 360) return 'bg-orange-500 hover:bg-orange-600';
  return 'bg-red-700 hover:bg-red-800';
}

export function getRelativeTime(createdAtISO) {
  const created = new Date(createdAtISO);
  const now = new Date();
  const diffSeconds = (now - created) / 1000;
  if (diffSeconds < 60) return `${Math.floor(diffSeconds)} sec ago`;
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} min ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hour ago`;
  return `${Math.floor(diffSeconds / 86400)} days ago`;
}