import { createRouteHandlerClient, createServerActionClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from './database.types'

export const supabaseServer = createServerComponentClient<Database>({ cookies: () => cookies() })
export const supabaseServerAction = createServerActionClient<Database>({ cookies: () => cookies() })
export const supabaseRoute = createRouteHandlerClient<Database>({ cookies: () => cookies() })

export async function isLoggedIn() {
	const { data } = await supabaseServer.auth.getSession()
	if (!data.session) return false
	return true
}
