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
          cookiesToSet.forEach(({ name, value, }) => request.cookies.set(name, value))
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

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // console.log("User in middleware:", user);
  // console.log("Request URL:", request.url);
  // console.log("Request Pathname:", request.nextUrl.pathname);
  // console.log("!request.nextUrl.pathname.startsWith('/'):", !request.nextUrl.pathname.startsWith('/'));


  const pathname = request.nextUrl.pathname

  // Redirect unauthenticated users if they try to access any protected /dashboard route
  if (
    !user &&
    pathname.startsWith('/dashboard')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    return NextResponse.redirect(url)
  }

  // Allow access to public (non-dashboard) pages
  if (!pathname.startsWith('/dashboard')) {
    return supabaseResponse
  }

  // Fetch user role from profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  if (profileError || !profile) {
    console.error('Error fetching profile:', profileError)
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
  }

  const rolePath = `/dashboard/${profile.role}`

  // Redirect user to their own role's dashboard if trying to access another role's dashboard
  if (!pathname.startsWith(rolePath)) {
    const url = request.nextUrl.clone()
    url.pathname = rolePath
    return NextResponse.redirect(url)
  }

  
  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}