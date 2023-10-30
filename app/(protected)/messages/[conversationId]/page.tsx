import { createServerSupabase, getAuth } from '@/lib/supabase.server'
import MessageGroup from './components/message-group'
import NewMessageForm from './components/new-message-form'

// TODO: What if conversation doesn't exist
export default async function ConversationPage({ params: { conversationId } }: { params: { conversationId: string } }) {
	const authedUser = await getAuth()

	const { data } = await createServerSupabase()
		.from('messages')
		.select('*, author:profiles(*)')
		.eq('conversation_id', conversationId)
		.order('created_at', { ascending: true })
	const messages =
		data?.map((message) => ({ ...message, author: Array.isArray(message.author) ? message.author[0] : message.author })) || []

	function groupMessages(arr: typeof messages): (typeof messages)[] {
		if (arr.length === 0) return []
		const result: (typeof messages)[] = []
		let currentGroup: typeof messages = [arr[0]]

		for (let i = 1; i < arr.length; i++) {
			if (arr[i].sender_id === arr[i - 1].sender_id) currentGroup.push(arr[i])
			else {
				result.push(currentGroup)
				currentGroup = [arr[i]]
			}
		}

		result.push(currentGroup)
		return result
	}

	const groupedMessages = groupMessages(messages)

	return (
		<div className='flex flex-col w-full h-full max-w-3xl p-4 mx-auto space-y-8'>
			{/* TODO: Scroll to bottom on page load and when there's a new message */}
			<div className='flex-1 space-y-4 overflow-y-auto'>
				{groupedMessages.map((group, i) => (
					<MessageGroup key={i} authedUser={authedUser} group={group} />
				))}
			</div>
			<NewMessageForm conversation_id={conversationId} sender_id={authedUser.id} />
		</div>
	)
}
