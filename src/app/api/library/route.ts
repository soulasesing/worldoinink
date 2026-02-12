import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all'; // 'all' | 'interactive' | 'linear'
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      published: true,
    };

    // Filter by type
    if (type === 'interactive') {
      where.isInteractive = true;
    } else if (type === 'linear') {
      where.isInteractive = false;
    }

    // Search by title
    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Get stories with author info and node count for interactive stories
    const [stories, total] = await Promise.all([
      prisma.story.findMany({
        where,
        select: {
          id: true,
          title: true,
          content: true,
          wordCount: true,
          views: true,
          likes: true,
          isInteractive: true,
          coverImageUrl: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              storyNodes: true,
            },
          },
        },
        orderBy: [
          { views: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.story.count({ where }),
    ]);

    // Process stories: truncate content for preview
    const processedStories = stories.map((story) => {
      // Strip HTML tags and truncate for preview
      const plainText = story.content
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();
      const preview = plainText.length > 200 
        ? plainText.substring(0, 200) + '...' 
        : plainText;

      return {
        ...story,
        content: preview,
      };
    });

    return NextResponse.json({
      stories: processedStories,
      total,
      page,
      hasMore: skip + stories.length < total,
    });
  } catch (error) {
    console.error('Error fetching library:', error);
    return NextResponse.json(
      { message: 'Error al cargar la biblioteca' },
      { status: 500 }
    );
  }
}
