import { createServerSupabase } from '@/lib/supabase.server'
import ProfileList from '../components/profile-list'

export default async function Followers({ params: { username } }: { params: { username: string } }) {
	const supabase = createServerSupabase()

	const { data: profile } = await supabase.from('profiles').select('id').eq('username', username).single()
	if (!profile) throw new Error('// TODO: No profile error - could be handled by parent?')

	const { data } = await supabase.from('friends').select('*, profile:profiles!initiator_id(*)').eq('friend_id', profile.id)
	const followers = data?.map((d) => ({ ...d, profile: Array.isArray(d.profile) ? d.profile[0] : d.profile })) || []

	return (
		<div className='max-w-lg py-4 mx-auto divide-y'>
			<ProfileList profiles={followers.map((f) => f.profile)} />
		</div>
	)
}
