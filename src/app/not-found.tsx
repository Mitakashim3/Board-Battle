import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="text-8xl mb-4">🤔</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or you don't have access to it.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}
