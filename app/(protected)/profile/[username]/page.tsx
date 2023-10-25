import Heading from '@/components/heading'
import { Button } from '@/components/ui/button'
import { getAuth, supabaseServer } from '@/lib/supabase.server'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import ActionButtons from './components/action-buttons'
import RecentPosts from './components/recent-posts'

export default async function ProfileDetails({ params: { username } }: { params: { username: string } }) {
	const { data: profile } = await supabaseServer.from('profiles').select().eq('username', username).single()
	// FIXME: Handle missing profile error
	if (!profile) throw new Error('Profile not found')

	const authedUser = await getAuth()
	const { data: friend } = await supabaseServer
		.from('friends')
		.select()
		.eq('initiator_id', authedUser.id)
		.eq('friend_id', profile.id)
		.single()
	const isFriend = !!friend

	return (
		<div className='max-w-xl pt-4 mx-auto space-y-4'>
			<div className='flex items-center space-x-6'>
				<div className='flex-shrink-0'>
					<Image className='rounded-full' src={profile.avatar_url} alt={profile.display_name} width={172} height={172} />
				</div>
				<div className='flex-1 space-y-4'>
					<Heading variant={1}>{profile.display_name}</Heading>
					<div className='flex items-center divide-x'>
						<div className='flex flex-col items-center flex-1'>
							<div className='text-xs'>Points</div>
							<Heading variant={3}>1500</Heading>
						</div>
						<div className='flex flex-col items-center flex-1'>
							<div className='text-xs'>Badges</div>
							<Heading variant={3}>1500</Heading>
						</div>
						<div className='flex flex-col items-center flex-1'>
							<div className='text-xs'>Days in Recovery</div>
							<Heading variant={3}>125</Heading>
						</div>
					</div>
					{authedUser.id !== profile.id && (
						<ActionButtons authedUserId={authedUser.id} profileId={profile.id} isFriend={isFriend} />
					)}
				</div>
			</div>
			{/* FIXME: Use real bio */}
			<div>
				<Heading variant={3}>About</Heading>
				<div className='text-sm'>
					Croissant pastry macaroon sweet roll. Soufflé soufflé jujubes chocolate bar chocolate biscuit danish cake gummies.
					Brownie fruitcake tart toffee croissant halvah cookie marzipan. Croissant donut powder sweet roll cupcake oat cake.
				</div>
			</div>
			<div className='space-y-2'>
				<Heading variant={3}>Recent Posts</Heading>
				{isFriend ? (
					<RecentPosts profileId={profile.id} />
				) : (
					<div className='text-sm italic text-foreground/50'>Follow this user to see their posts.</div>
				)}
			</div>
		</div>
	)
}
