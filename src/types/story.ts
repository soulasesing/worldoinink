/**
 * Story Types
 * Interfaces que coinciden exactamente con el schema de Prisma
 */

/**
 * Story interface que coincide con Prisma Schema
 */
export interface Story {
  id: string;                    // cuid de Prisma
  title: string;
  content: string;               // Texto largo (puede ser HTML de Quill)
  wordCount: number;
  published: boolean;            // true = Published, false = Draft
  views: number;
  likes: number;
  coverImageUrl: string | null;  // URL de portada o null
  createdAt: string;             // ISO date string
  updatedAt: string;             // ISO date string
  authorId: string;
}

/**
 * Stats calculados del usuario
 */
export interface UserStats {
  storiesWritten: number;
  totalViews: number;
  totalLikes: number;
  publishedCount: number;
  draftCount: number;
}

/**
 * Tipo para el filtro de historias
 */
export type StoryFilter = 'all' | 'published' | 'draft';

/**
 * Props para componentes de Story
 */
export interface StoryCardProps {
  story: Story;
  onEdit?: (storyId: string) => void;
  onDelete?: (storyId: string) => void;
}

