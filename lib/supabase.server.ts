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

export async function getAuth() {
	const {
		data: { user },
	} = await supabaseServer.auth.getUser()
	if (!user) throw new Error('getAuth needs to be used in an authenticated view')

	const { data: profile } = await supabaseServer.from('profiles').select().eq('id', user.id).single()
	if (!profile) throw new Error('getAuth needs to be used in an authenticated view')

	return profile
}
