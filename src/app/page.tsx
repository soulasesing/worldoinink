import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
            Bring Your Stories to Life with{' '}
            <span className="text-primary">World in Ink</span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
            A digital writing platform that helps creators craft compelling stories with AI-assisted tools,
            character development, and seamless collaboration.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">Sign In</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Features for Writers</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to create your next masterpiece
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* AI Character Creation */}
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold">AI Character Creation</h3>
              <p className="mt-2 text-muted-foreground">
                Generate unique characters with detailed backstories and personality traits using AI.
              </p>
            </div>

            {/* Grammar Checker */}
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold">Smart Grammar Checker</h3>
              <p className="mt-2 text-muted-foreground">
                Polish your writing with advanced grammar and style suggestions.
              </p>
            </div>

            {/* Analytics */}
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold">Story Analytics</h3>
              <p className="mt-2 text-muted-foreground">
                Track your story's performance with detailed analytics and reader engagement metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold">Ready to Start Writing?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of writers who are already creating amazing stories.
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button size="lg">Create Your Account</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
