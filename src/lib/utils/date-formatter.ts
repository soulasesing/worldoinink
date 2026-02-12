/**
 * Date Formatter Utilities
 * Utilidades para formatear fechas de forma amigable
 */

/**
 * Formatea una fecha en formato relativo (Today, Yesterday, 3 days ago, etc.)
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Formatea una fecha en formato corto (Jan 5, 2025)
 */
export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Formatea una fecha en formato completo (January 5, 2025)
 */
export function formatLongDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Formatea solo el tiempo (2:30 PM)
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Formatea fecha y hora (Jan 5, 2025 at 2:30 PM)
 */
export function formatDateTime(dateString: string): string {
  return `${formatShortDate(dateString)} at ${formatTime(dateString)}`;
}

