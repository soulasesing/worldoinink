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

      {/* New Boxes Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Explore Features</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Discover what World in Ink can do for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Box 1 */}
            <div className="relative overflow-hidden rounded-lg bg-card p-6 shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl border border-border">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 transition-opacity duration-300 hover:opacity-100" />
              <div className="relative z-10 space-y-4">
                <h3 className="text-xl font-semibold text-card-foreground">Placeholder Title 1</h3>
                <p className="text-muted-foreground">This is a placeholder for a feature description or content block. It highlights a key aspect of the application.</p>
                <div className="pt-4">
                  {/* Placeholder for a button or link */}
                  <span className="text-primary font-medium">Learn More &rarr;</span>
                </div>
              </div>
            </div>

            {/* Box 2 */}
            <div className="relative overflow-hidden rounded-lg bg-card p-6 shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl border border-border">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 transition-opacity duration-300 hover:opacity-100" />
              <div className="relative z-10 space-y-4">
                <h3 className="text-xl font-semibold text-card-foreground">Placeholder Title 2</h3>
                <p className="text-muted-foreground">This is another placeholder text to describe a different feature or aspect of World in Ink.</p>
                <div className="pt-4">
                  {/* Placeholder for a button or link */}
                  <span className="text-primary font-medium">Discover More &rarr;</span>
                </div>
              </div>
            </div>

            {/* Box 3 */}
            <div className="relative overflow-hidden rounded-lg bg-card p-6 shadow-lg transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl border border-border">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-yellow-500/10 opacity-0 transition-opacity duration-300 hover:opacity-100" />
              <div className="relative z-10 space-y-4">
                <h3 className="text-xl font-semibold text-card-foreground">Placeholder Title 3</h3>
                <p className="text-muted-foreground">And a third placeholder, representing yet another exciting feature or benefit of using our platform.</p>
                <div className="pt-4">
                  {/* Placeholder for a button or link */}
                  <span className="text-primary font-medium">Explore Now &rarr;</span>
                </div>
              </div>
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
