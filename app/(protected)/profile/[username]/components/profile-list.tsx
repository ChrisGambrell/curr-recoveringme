import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { getAuth } from '@/lib/supabase.server'
import Link from 'next/link'

// TODO: Follow / unfollow
export default async function ProfileList({ profiles }: { profiles: Profile[] }) {
	const authedUser = await getAuth()

	return (
		<>
			{profiles.map((profile) => (
				<div key={profile.id} className='flex items-center py-2 space-x-4'>
					<div className='flex items-center flex-1 space-x-2'>
						<Avatar className='w-8 h-8'>
							<AvatarImage src={profile.avatar_url} alt={profile.display_name} />
						</Avatar>
						<Link href={`/profile/${profile.username}`} className='hover:underline'>
							{profile.display_name}
						</Link>
					</div>
					<div className='flex-shrink-0'>
						<Button size='xs'>{!!authedUser.following.find((a) => a.friend_id === profile.id) ? 'Unfollow' : 'Follow'}</Button>
					</div>
				</div>
			))}
		</>
	)
}
