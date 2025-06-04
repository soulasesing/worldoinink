'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/editor">
          <Button>New Story</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder for stories */}
        <div className="bg-background p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold mb-2">Your First Story</h3>
          <p className="text-muted-foreground mb-4">
            Start writing your first story and bring your ideas to life.
          </p>
          <Link href="/editor">
            <Button variant="outline" className="w-full">
              Start Writing
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 