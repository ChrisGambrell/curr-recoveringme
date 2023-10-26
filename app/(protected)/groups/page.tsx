import { createServerSupabase } from '@/lib/supabase.server'

export default async function GroupsPage() {
	const supabase = createServerSupabase()

	const { data } = await supabase.from('groups').select('*')
	const groups = data || []

	return <pre>{JSON.stringify(groups, null, 2)}</pre>
}
