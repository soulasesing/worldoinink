import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { put } from '@vercel/blob';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return new NextResponse('File must be an image', { status: 400 });
    }

    // Create a unique filename
    const filename = `${Date.now()}-${file.name}`;

    // Upload to Vercel Blob
    const { url } = await put(filename, file, {
      access: 'public',
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    return new NextResponse('Upload failed', { status: 500 });
  }
} 