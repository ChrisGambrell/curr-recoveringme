import Post from '@/components/post'
import { createServerSupabase } from '@/lib/supabase.server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function FeedPage() {
	const supabase = createServerSupabase()

	const { data } = await supabase.from('posts').select('*, author:profiles(*), comments(*)').order('created_at', { ascending: false })
	const posts =
		data?.map((post) => ({
			...post,
			author: Array.isArray(post.author) ? post.author[0] : post.author,
		})) || []

	return (
		<div className='max-w-lg pt-8 mx-auto space-y-4'>
			{posts.map((post) => (
				<Post key={post.id} post={post} />
			))}
		</div>
	)
}
