'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function ConversationLink({ authedUser, conversation }: { authedUser: Profile; conversation: ConversationWithMembers }) {
	const members = conversation.members.filter((m) => m.id !== authedUser.id)
	const pathname = usePathname()

	if (members.length === 0) return null
	return (
		<Link
			key={conversation.id}
			className={cn(
				'flex items-center px-4 py-2 space-x-2',
				pathname.endsWith(`/messages/${conversation.id}`) ? 'bg-card' : 'hover:bg-card'
			)}
			href={`/messages/${conversation.id}`}>
			<Image className='rounded-full' src={members[0].avatar_url} alt={members[0].display_name} width={40} height={40} />
			<div>{members.map((member) => member.display_name).join(', ')}</div>
		</Link>
	)
}
