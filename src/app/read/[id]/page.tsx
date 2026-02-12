import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { InteractiveReader } from '@/components/interactive-story';
import { notFound } from 'next/navigation';

interface PageProps {
  params: { id: string };
}

// Generate metadata for the page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const story = await prisma.story.findUnique({
    where: { id: params.id },
    select: { title: true, isInteractive: true },
  });

  if (!story) {
    return { title: 'Historia no encontrada - World in Ink' };
  }

  return {
    title: `${story.title} - Historia Interactiva | World in Ink`,
    description: `Lee y toma decisiones en "${story.title}", una historia interactiva donde tú eliges el camino.`,
  };
}

export default async function ReadInteractiveStoryPage({ params }: PageProps) {
  // Verify story exists and is interactive
  const story = await prisma.story.findUnique({
    where: { id: params.id },
    select: { 
      id: true, 
      title: true, 
      isInteractive: true, 
      published: true,
      authorId: true,
    },
  });

  if (!story) {
    notFound();
  }

  // Check if story is interactive
  if (!story.isInteractive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📖</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Historia lineal</h2>
          <p className="text-gray-400 mb-6">
            Esta historia no es interactiva. Puedes leerla en el modo clásico.
          </p>
          <a 
            href={`/story/${story.id}`}
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            Leer historia
          </a>
        </div>
      </div>
    );
  }

  // Check if published (for non-authors)
  // Note: The InteractiveReader component handles the auth check
  
  return <InteractiveReader storyId={story.id} />;
}
