'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { signupSchema, type SignupInput } from '@/lib/validations';
import { Input, Button } from '@/components/ui';
import { OAuthButtons } from '@/components/auth/OAuthButtons';

export default function SignupPage() {
  const router = useRouter();
  
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError('');
    
    // Validate form data
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
      
      // Redirect to dashboard (user profile is created via trigger)
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-4xl">⚔️</span>
            <h1 className="text-2xl font-bold text-foreground mt-2">Board Battle</h1>
          </Link>
          <p className="text-muted-foreground mt-2">Join the battle for knowledge!</p>
        </div>
        
        {/* Signup Form */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          {/* OAuth Buttons - Fastest signup method */}
          <OAuthButtons />
          
          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or sign up with email</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {serverError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {serverError}
              </div>
            )}
            
            <Input
              label="Username"
              type="text"
              placeholder="Choose a username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              error={errors.username}
              disabled={isLoading}
              autoComplete="username"
            />
            
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              disabled={isLoading}
              autoComplete="email"
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              helperText="Min 8 chars, with uppercase, lowercase, and number"
              disabled={isLoading}
              autoComplete="new-password"
            />
            
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
              disabled={isLoading}
              autoComplete="new-password"
            />
            
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
        
        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </main>
  );
}
