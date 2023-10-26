'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function MessageGroup({ authedUser, group }: { authedUser: Profile; group: MessageWithAuthor[] }) {
	const router = useRouter()

	return (
		<div className='flex items-end space-x-2'>
			{authedUser.id !== group[0].user_id && (
				<Image
					className='rounded-full cursor-pointer'
					src={group[0].author.avatar_url}
					alt={group[0].author.display_name}
					width={28}
					height={28}
					onClick={() => router.push(`/profile/${group[0].author.username}`)}
				/>
			)}
			<div className='w-full space-y-1'>
				{group.map((message) => (
					<div
						key={message.id}
						className={cn(
							'w-fit px-3 py-1.5 rounded first:rounded-t-xl max-w-xl',
							message.user_id === authedUser.id ? 'ml-auto bg-muted/75 last:rounded-bl-xl' : 'bg-card last:rounded-br-xl'
						)}>
						{message.body}
					</div>
				))}
			</div>
		</div>
	)
}
