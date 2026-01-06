/**
 * Gradient Generator Utility
 * Genera gradientes consistentes basados en strings (títulos, IDs, etc.)
 */

const GRADIENT_COLORS = [
  'from-blue-400 to-cyan-600',
  'from-purple-400 to-pink-600',
  'from-green-400 to-emerald-600',
  'from-orange-400 to-red-600',
  'from-indigo-400 to-purple-600',
  'from-teal-400 to-cyan-600',
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-600',
  'from-lime-400 to-green-600',
  'from-sky-400 to-blue-600',
  'from-violet-400 to-purple-600',
  'from-fuchsia-400 to-pink-600',
];

/**
 * Genera un hash simple de un string
 */
function simpleHash(str: string): number {
  return str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

/**
 * Genera un gradient de Tailwind consistente basado en un título
 * El mismo título siempre generará el mismo gradient
 */
export function generateGradientFromTitle(title: string): string {
  const hash = simpleHash(title);
  return GRADIENT_COLORS[hash % GRADIENT_COLORS.length];
}

/**
 * Genera un gradient de Tailwind consistente basado en un ID
 * El mismo ID siempre generará el mismo gradient
 */
export function generateGradientFromId(id: string): string {
  const hash = simpleHash(id);
  return GRADIENT_COLORS[hash % GRADIENT_COLORS.length];
}

/**
 * Obtiene un gradient aleatorio (útil para demos)
 */
export function getRandomGradient(): string {
  const randomIndex = Math.floor(Math.random() * GRADIENT_COLORS.length);
  return GRADIENT_COLORS[randomIndex];
}

/**
 * Obtiene todos los gradientes disponibles
 */
export function getAllGradients(): string[] {
  return [...GRADIENT_COLORS];
}

