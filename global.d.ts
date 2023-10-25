import { Database as TDatabase } from '@/lib/database.types'
import Stripe from 'stripe'

declare global {
	type Database = TDatabase
	type Row<T extends keyof Database['public']['Tables']> = TDatabase['public']['Tables'][T]['Row']

	type Comment = Row<'comments'>
	type Post = Row<'posts'>
	type Profile = Row<'profiles'>

	type PostWithAuthorAndComments = Post & { author: Profile; comments: Comment[] }
}
