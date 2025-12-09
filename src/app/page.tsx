'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import {
  Swords,
  BookOpen,
  Trophy,
  Users,
  Zap,
  Shield,
  GraduationCap,
  Stethoscope,
  Scale,
  FileText,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Target,
  BarChart3,
  Clock,
  Check,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { signupSchema, type SignupInput } from '@/lib/validations';
import { OAuthButtons } from '@/components/auth/OAuthButtons';

export default function HomePage() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const signupRef = useRef<HTMLDivElement>(null);
  const bgShapesRef = useRef<HTMLDivElement>(null);

  // Signup form state
  const [formData, setFormData] = useState<SignupInput>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const supabase = createClient();

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background shapes float
      gsap.to('.bg-shape', {
        y: -30,
        duration: 8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 2,
      });

      // Hero section fade in
      gsap.fromTo(
        '.hero-content',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.15 }
      );

      // Feature cards stagger
      gsap.fromTo(
        '.feature-card',
        { y: 30, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power3.out',
          delay: 0.3,
        }
      );

      // Signup section
      gsap.fromTo(
        '.signup-card',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.5 }
      );
    });

    return () => ctx.revert();
  }, []);

  // Handle signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError('');

    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
          },
        },
      });

      if (error) {
        setServerError(error.message);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const examTypes = [
    {
      icon: GraduationCap,
      title: 'LET',
      subtitle: 'Licensure Exam for Teachers',
      color: 'from-emerald-500/20 to-emerald-600/5',
      iconColor: 'text-emerald-400',
    },
    {
      icon: Stethoscope,
      title: 'Nursing',
      subtitle: 'Nursing Licensure Exam',
      color: 'from-blue-500/20 to-blue-600/5',
      iconColor: 'text-blue-400',
    },
    {
      icon: Scale,
      title: 'Criminology',
      subtitle: 'Criminologist Licensure Exam',
      color: 'from-orange-500/20 to-orange-600/5',
      iconColor: 'text-orange-400',
    },
    {
      icon: FileText,
      title: 'CSE',
      subtitle: 'Civil Service Examination',
      color: 'from-purple-500/20 to-purple-600/5',
      iconColor: 'text-purple-400',
    },
  ];

  const features = [
    {
      icon: Swords,
      title: 'Real-time 1v1 Battles',
      description: 'Challenge other reviewers in intense head-to-head battles. Climb the ranks and prove your mastery.',
      iconColor: 'text-red-400',
    },
    {
      icon: Zap,
      title: 'Gamified Learning',
      description: 'Earn coins, build streaks, and unlock achievements. Learning has never been this engaging.',
      iconColor: 'text-yellow-400',
    },
    {
      icon: Target,
      title: 'Adaptive Review',
      description: 'Our system focuses on your weak areas. Smart question selection for maximum retention.',
      iconColor: 'text-emerald-400',
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description: 'Detailed analytics on your performance. Know exactly where you stand before exam day.',
      iconColor: 'text-blue-400',
    },
    {
      icon: Trophy,
      title: 'Global Leaderboards',
      description: 'Compete with thousands of reviewers nationwide. Top rankers get exclusive rewards.',
      iconColor: 'text-purple-400',
    },
    {
      icon: Clock,
      title: 'Study Anywhere',
      description: 'Mobile-first design. Review during commute, breaks, or anytime you have a spare moment.',
      iconColor: 'text-cyan-400',
    },
  ];

  const stats = [
    { value: '50K+', label: 'Questions' },
    { value: '10K+', label: 'Reviewers' },
    { value: '95%', label: 'Pass Rate' },
    { value: '4.9', label: 'App Rating' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#071020] to-[#030812] text-white overflow-hidden">
      {/* Background 3D Shapes */}
      <div ref={bgShapesRef} className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="bg-shape absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-b from-[#1a3a5c]/20 to-transparent rounded-full blur-3xl" />
        <div className="bg-shape absolute top-60 right-1/4 w-64 h-80 bg-gradient-to-b from-[#0d2847]/30 to-transparent rounded-full blur-3xl" />
        <div className="bg-shape absolute bottom-40 left-1/3 w-80 h-80 bg-gradient-to-t from-[#1a3a5c]/10 to-transparent rounded-full blur-3xl" />
        {/* Vertical light columns */}
        <div className="absolute top-0 left-[15%] w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
        <div className="absolute top-0 left-[50%] w-px h-full bg-gradient-to-b from-transparent via-white/3 to-transparent" />
        <div className="absolute top-0 left-[85%] w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/5 bg-[#0a1628]/60 backdrop-blur-xl">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a4a7c] to-[#0d2847] flex items-center justify-center">
                <Swords className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg lg:text-xl">Board Battle</span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
              <a href="#exams" className="text-gray-400 hover:text-white transition-colors">Exams</a>
              <a href="#signup" className="text-gray-400 hover:text-white transition-colors">Get Started</a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="#signup"
                className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-[#1a4a7c] to-[#2a5a8c] hover:from-[#2a5a8c] hover:to-[#3a6a9c] transition-all duration-200 hover:-translate-y-0.5"
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-16 lg:pt-24 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Hero Content */}
            <div className="text-center lg:text-left">
              <div className="hero-content inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-6">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Now with Civil Service Exam coverage</span>
              </div>

              <h1 className="hero-content text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Master Your{' '}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Board Exams
                </span>
                <br />
                Through Battle
              </h1>

              <p className="hero-content text-lg lg:text-xl text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0">
                The gamified reviewer that makes studying addictive. Challenge friends,
                climb the ranks, and ace your exams with our battle-tested platform.
              </p>

              {/* Stats */}
              <div className="hero-content grid grid-cols-4 gap-4 mb-8 max-w-lg mx-auto lg:mx-0">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="hero-content flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="#signup"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-[#1a4a7c] to-[#2a5a8c] hover:from-[#2a5a8c] hover:to-[#3a6a9c] transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1a4a7c]/20"
                >
                  Start Reviewing Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* Right: Signup Form */}
            <div ref={signupRef} id="signup" className="lg:pl-8">
              <div className="signup-card relative max-w-md mx-auto">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#1a4a7c]/50 to-[#0d2847]/50 rounded-3xl blur-xl opacity-50" />
                
                <div className="relative rounded-2xl bg-gradient-to-br from-[#0d1f35] to-[#071020] border border-white/10 p-6 lg:p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2">Create Your Account</h2>
                    <p className="text-gray-400 text-sm">Join the battle for knowledge</p>
                  </div>

                  {/* OAuth Buttons */}
                  <OAuthButtons />

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-[#0d1f35] px-3 text-gray-500">Or sign up with email</span>
                    </div>
                  </div>

                  {/* Signup Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {serverError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        {serverError}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
                      <input
                        type="text"
                        placeholder="Choose a username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        disabled={isLoading}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#1a4a7c] focus:ring-1 focus:ring-[#1a4a7c] transition-colors disabled:opacity-50"
                      />
                      {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={isLoading}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#1a4a7c] focus:ring-1 focus:ring-[#1a4a7c] transition-colors disabled:opacity-50"
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        disabled={isLoading}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#1a4a7c] focus:ring-1 focus:ring-[#1a4a7c] transition-colors disabled:opacity-50"
                      />
                      <p className="mt-1 text-xs text-gray-500">Min 8 chars with uppercase, lowercase & number</p>
                      {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        disabled={isLoading}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#1a4a7c] focus:ring-1 focus:ring-[#1a4a7c] transition-colors disabled:opacity-50"
                      />
                      {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#1a4a7c] to-[#2a5a8c] hover:from-[#2a5a8c] hover:to-[#3a6a9c] font-semibold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </form>

                  <p className="mt-4 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Exams Section */}
      <section id="exams" className="relative py-20 border-t border-white/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Supported Board Exams</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Comprehensive coverage for the Philippines' top professional licensure exams
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-4xl mx-auto">
            {examTypes.map((exam) => (
              <div
                key={exam.title}
                className="feature-card group relative rounded-2xl bg-gradient-to-br from-[#0d1f35] to-[#071020] border border-white/10 p-6 hover:border-white/20 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1a4a7c]/10 transition-all duration-300 text-center"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${exam.color} flex items-center justify-center mx-auto mb-4`}>
                  <exam.icon className={`w-7 h-7 ${exam.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold mb-1">{exam.title}</h3>
                <p className="text-sm text-gray-400">{exam.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="relative py-20 border-t border-white/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Why Board Battle?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We've reimagined how board exam review should work. Here's what makes us different.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="feature-card group relative rounded-2xl bg-gradient-to-br from-[#0d1f35] to-[#071020] border border-white/10 p-6 hover:border-white/20 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1a4a7c]/10 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 border-t border-white/5">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Ace Your Exams?</h2>
            <p className="text-gray-400 mb-8">
              Join thousands of future professionals preparing for their board exams the fun way.
              Start your journey today - it's completely free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="#signup"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-[#1a4a7c] to-[#2a5a8c] hover:from-[#2a5a8c] hover:to-[#3a6a9c] transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1a4a7c]/20"
              >
                Get Started - It's Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 border-t border-white/5">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1a4a7c] to-[#0d2847] flex items-center justify-center">
                <Swords className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">Board Battle</span>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Board Battle. Made with passion in the Philippines.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
