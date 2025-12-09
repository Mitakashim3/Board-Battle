import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Routes that require authentication (student-only)
const studentRoutes = ['/reviewer', '/battle', '/profile', '/dashboard'];

// Routes that require admin role (admin-only)
const adminRoutes = ['/admin'];

// Routes that should redirect if already authenticated
const authRoutes = ['/login', '/signup'];

// Admin-specific auth route
const adminAuthRoute = '/auth/admin-portal';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Update session and get user
  const { response, user, supabase } = await updateSession(request);

  // Check route types
  const isStudentRoute = studentRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  const isAdminAuthRoute = pathname.startsWith(adminAuthRoute);

  // Redirect to login if accessing protected route without auth
  if ((isStudentRoute || isAdminRoute) && !user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is logged in, check their role for proper routing
  if (user) {
    // Fetch user role from database
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = userData?.role === 'admin';

    // ADMIN RESTRICTIONS:
    // Admins cannot access student routes - redirect to admin dashboard
    if (isAdmin && isStudentRoute) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Admins at regular auth routes should go to admin dashboard
    if (isAdmin && isAuthRoute) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // STUDENT RESTRICTIONS:
    // Non-admins cannot access admin routes - show 404
    if (!isAdmin && isAdminRoute) {
      return NextResponse.rewrite(new URL('/not-found', request.url));
    }

    // Non-admins at admin auth route should go to regular login
    if (!isAdmin && isAdminAuthRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Regular students at auth routes go to dashboard
    if (!isAdmin && isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Add security headers
  const securityHeaders = new Headers(response.headers);
  securityHeaders.set('X-Content-Type-Options', 'nosniff');
  securityHeaders.set('X-Frame-Options', 'DENY');
  securityHeaders.set('X-XSS-Protection', '1; mode=block');
  securityHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
