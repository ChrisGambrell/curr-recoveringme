import Heading from '@/components/heading'
import { Button } from '@/components/ui/button'
import { createServerSupabase, getAuth } from '@/lib/supabase.server'
import { LayoutProps } from '@/lib/utils'
import { PlusIcon } from 'lucide-react'
import ConversationLink from './components/conversation-link'

export default async function MessagesLayout({ children }: LayoutProps) {
	const supabase = createServerSupabase()
	const authedUser = await getAuth()

	const { data } = await supabase.from('conversations').select('*, members:conversation_members(*, member:profiles(*))')
	const conversations = data?.map((d) => ({ ...d, members: d.members.filter((m) => m.member).map((m) => m.member!) })) || []

	return (
		<div className='flex w-full h-full space-x-4'>
			<div className='flex flex-col flex-shrink-0 w-full max-w-xs py-4 space-y-4 bg-muted/60 rounded-r-xl'>
				<div className='flex items-center justify-between flex-shrink-0 px-4'>
					<Heading variant={3}>Conversations</Heading>
					{/* TODO: New conversation button */}
					<Button className='w-8 h-8' size='icon'>
						<PlusIcon className='w-5 h-5' />
					</Button>
				</div>
				<div className='flex-1 overflow-y-auto'>
					{conversations.map((conversation) => (
						<ConversationLink key={conversation.id} authedUser={authedUser} conversation={conversation} />
					))}
				</div>
			</div>
			<div className='flex-1'>{children}</div>
		</div>
	)
}
