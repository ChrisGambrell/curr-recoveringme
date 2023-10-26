import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createServerSupabase = () => {
	const cookieStore = cookies()
	return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

export async function isLoggedIn() {
	const supabase = createServerSupabase()
	const { data } = await supabase.auth.getSession()
	if (!data.session) return false
	return true
}

export async function getAuth() {
	const supabase = createServerSupabase()

	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) throw new Error('getAuth needs to be used in an authenticated view')

	const { data: profile } = await supabase.from('profiles').select().eq('id', user.id).single()
	if (!profile) throw new Error('getAuth needs to be used in an authenticated view')

	return profile
}
