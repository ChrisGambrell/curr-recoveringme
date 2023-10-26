import { Database as TDatabase } from '@/lib/database.types'
import Stripe from 'stripe'

declare global {
	type Database = TDatabase
	type Row<T extends keyof Database['public']['Tables']> = TDatabase['public']['Tables'][T]['Row']

	type Comment = Row<'comments'>
	type Conversation = Row<'conversations'>
	type Message = Row<'messages'>
	type Post = Row<'posts'>
	type Profile = Row<'profiles'>

	type ConversationWithMembers = Conversation & { members: Profile[] }
	type MessageWithAuthor = Message & { author: Profile }
	type PostWithAuthorAndComments = Post & { author: Profile; comments: Comment[] }
}
