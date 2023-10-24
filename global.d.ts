import { Database as TDatabase } from '@/lib/database.types'
import Stripe from 'stripe'

declare global {
	type Database = TDatabase
	type Row<T extends keyof Database['public']['Tables']> = TDatabase['public']['Tables'][T]['Row']

	type Post = Row<'posts'>
	type Profile = Row<'profiles'>

	type PostWithAuthor = Post & { author: Profile }
}
