'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { gsap } from 'gsap';
import { Swords } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { signupSchema, type SignupInput } from '@/lib/validations';
import { OAuthButtons } from '@/components/auth/OAuthButtons';

export default function SignupPage() {
  const router = useRouter();
  const bgShapesRef = useRef<HTMLDivElement>(null);

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
      gsap.to('.bg-shape', {
        y: -30,
        duration: 8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 2,
      });

      gsap.fromTo(
        '.signup-card',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      );
    });

    return () => ctx.revert();
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#071020] to-[#030812] text-white overflow-hidden">
      {/* Background 3D Shapes */}
      <div ref={bgShapesRef} className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="bg-shape absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-b from-[#1a3a5c]/20 to-transparent rounded-full blur-3xl" />
        <div className="bg-shape absolute top-60 right-1/4 w-64 h-80 bg-gradient-to-b from-[#0d2847]/30 to-transparent rounded-full blur-3xl" />
        <div className="bg-shape absolute bottom-40 left-1/3 w-80 h-80 bg-gradient-to-t from-[#1a3a5c]/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-0 left-[15%] w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
        <div className="absolute top-0 left-[50%] w-px h-full bg-gradient-to-b from-transparent via-white/3 to-transparent" />
        <div className="absolute top-0 left-[85%] w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1a4a7c] to-[#0d2847] flex items-center justify-center">
                <Swords className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Board Battle</h1>
            </Link>
            <p className="text-gray-400 mt-2">Join the battle for knowledge!</p>
          </div>

          {/* Signup Form */}
          <div className="signup-card relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#1a4a7c]/50 to-[#0d2847]/50 rounded-3xl blur-xl opacity-50" />

            <div className="relative rounded-2xl bg-gradient-to-br from-[#0d1f35] to-[#071020] border border-white/10 p-6 lg:p-8">
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
                    autoComplete="username"
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
                    autoComplete="email"
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
                    autoComplete="new-password"
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
                    autoComplete="new-password"
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

              <p className="mt-6 text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-gray-500">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
