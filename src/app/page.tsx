import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Master Your{' '}
              <span className="text-primary">Board Exams</span>
              <br />
              Through Battle
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Gamified reviewing for LET, Nursing, and Criminology board exams.
              Challenge friends, climb the ranks, and ace your exams!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors"
              >
                Start Reviewing Free
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-secondary text-secondary-foreground rounded-xl font-semibold text-lg hover:bg-secondary/80 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 text-6xl opacity-20 animate-pulse-slow">📚</div>
        <div className="absolute top-40 right-10 text-5xl opacity-20 animate-pulse-slow">⚔️</div>
        <div className="absolute bottom-20 left-20 text-4xl opacity-20 animate-pulse-slow">🏆</div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Why Board Battle?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Gamified Learning
              </h3>
              <p className="text-muted-foreground">
                Swipe through questions like a game. Earn coins, build streaks, and stay motivated.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Real-time Battles
              </h3>
              <p className="text-muted-foreground">
                Challenge other reviewers in 1v1 battles. Compete on the leaderboard and prove your knowledge.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Mobile-First Design
              </h3>
              <p className="text-muted-foreground">
                Study anywhere, anytime. Optimized for one-handed mobile use in the thumb zone.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Exam Types */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Supported Board Exams
          </h2>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center p-6 bg-card rounded-2xl border border-border">
              <div className="text-5xl mb-3">👩‍🏫</div>
              <h3 className="font-semibold text-foreground">LET</h3>
              <p className="text-sm text-muted-foreground">Licensure Exam for Teachers</p>
            </div>
            <div className="text-center p-6 bg-card rounded-2xl border border-border">
              <div className="text-5xl mb-3">👩‍⚕️</div>
              <h3 className="font-semibold text-foreground">Nursing</h3>
              <p className="text-sm text-muted-foreground">Nursing Licensure Exam</p>
            </div>
            <div className="text-center p-6 bg-card rounded-2xl border border-border">
              <div className="text-5xl mb-3">👮</div>
              <h3 className="font-semibold text-foreground">Criminology</h3>
              <p className="text-sm text-muted-foreground">Criminologist Licensure Exam</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of future professionals preparing for their board exams the fun way.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors"
          >
            Get Started — It's Free
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Board Battle. Made with ❤️ in the Philippines.</p>
        </div>
      </footer>
    </main>
  );
}
