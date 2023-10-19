import { supabaseRoute } from '@/lib/supabase.server'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
	const requestUrl = new URL(request.url)
	const code = requestUrl.searchParams.get('code')

	if (code) await supabaseRoute.auth.exchangeCodeForSession(code)
	return NextResponse.redirect(requestUrl.origin)
}