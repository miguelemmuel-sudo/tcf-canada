import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run getUser on auth callback or public routes aggressively if not needed,
  // but since we want to protect /dashboard and /admin, we will call it.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const hasLocalCookie = request.cookies.get('griffon_user_email')?.value || request.cookies.get('tcf_logged_in')?.value;
  const isPaymentRoute = pathname.startsWith('/dashboard/payments');

  // Protected routes check: ne pas bloquer les candidats en cours de paiement ou inscrits
  if (!user && !hasLocalCookie && !isPaymentRoute) {
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // Admin route check - Contrôle serveur strict des rôles (Admin vs User)
  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard/admin')) {
    let isUserAdminRole = false;
    if (user) {
      const email = user.email?.toLowerCase().trim() || '';
      const isAdminEmail = [
        'emmuel.proreseau@gmail.com', 
        'joumefiomiguel@gmail.com', 
        'miguelemmuel@gmail.com', 
        'admin.miguel@griffondor.com', 
        'miguel.admin@griffondor.com', 
        'admin@griffondor.com', 
        'miguel@griffondor.com'
      ].includes(email);

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_admin')
        .eq('id', user.id)
        .maybeSingle();

      isUserAdminRole = isAdminEmail || Boolean(profile?.is_admin) || profile?.role === 'superadmin';
    }

    if (!isUserAdminRole) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
