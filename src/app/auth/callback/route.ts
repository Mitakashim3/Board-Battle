import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * OAuth Callback Handler
 * 
 * SECURITY NOTES:
 * 1. PKCE (Proof Key for Code Exchange) is automatically used by Supabase
 *    - Prevents authorization code interception attacks
 *    - Code verifier is stored in HttpOnly cookies
 * 
 * 2. State parameter is automatically validated by Supabase
 *    - Prevents CSRF attacks
 * 
 * 3. The authorization code is exchanged server-side
 *    - Never exposed to the client
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  // Handle OAuth errors (user cancelled, etc.)
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
    );
  }

  if (code) {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Server component, cookies will be set in response
            }
          },
        },
      }
    );

    // Exchange the code for a session
    // This uses PKCE automatically - the code_verifier is retrieved from cookies
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Code exchange error:', exchangeError.message);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent('Authentication failed')}`, requestUrl.origin)
      );
    }

    if (data.user) {
      // Check if user profile exists, create if not
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (!existingUser) {
        // Create user profile for OAuth users
        const displayName = data.user.user_metadata?.full_name 
          || data.user.user_metadata?.name 
          || data.user.email?.split('@')[0] 
          || 'Player';

        const avatarUrl = data.user.user_metadata?.avatar_url 
          || data.user.user_metadata?.picture;

        await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email,
          display_name: displayName,
          avatar_url: avatarUrl,
          role: 'student',
          coins: 100, // Starting coins
          energy: 5,
          max_energy: 5,
          mmr: 1000,
        });
      }
    }

    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  // No code provided, redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
