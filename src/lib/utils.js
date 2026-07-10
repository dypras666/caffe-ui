const API_ORIGIN = import.meta.env.VITE_API_URL || '';

/**
 * Resolve a media path from the backend.
 * If the path is already absolute (starts with http), return as-is.
 * Otherwise prefix with the backend origin.
 */
export function mediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_ORIGIN}${path}`;
}
