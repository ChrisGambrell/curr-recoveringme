'use client'

import Loading from '@/components/loading'
import { Button } from '@/components/ui/button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ActionButtons({
	authedUserId,
	profileId,
	isFriend,
}: {
	authedUserId: string
	profileId: string
	isFriend: boolean
}) {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)

	const handleToggleFriend = async () => {
		setIsLoading(true)

		const supabase = createClientComponentClient<Database>()
		if (isFriend) await supabase.from('friends').delete().eq('initiator_id', authedUserId).eq('friend_id', profileId)
		else await supabase.from('friends').insert({ initiator_id: authedUserId, friend_id: profileId })
		router.refresh()

		setIsLoading(false)
	}

	return (
		<div className='flex items-center space-x-2'>
			{/* TODO: Link to messages */}
			<Button className='flex-1'>Message</Button>
			<Button className='flex-shrink-0' disabled={isLoading} variant='outline' onClick={handleToggleFriend}>
				{isLoading ? <Loading /> : isFriend ? 'Unfollow' : 'Follow'}
			</Button>
		</div>
	)
}
