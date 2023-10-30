import Post from '@/components/post'
import { createServerSupabase } from '@/lib/supabase.server'

export default async function RecentPosts({ profileId }: { profileId: string }) {
	const supabase = createServerSupabase()

	const { data, error } = await supabase
		.from('posts')
		.select('*, author:profiles(*), comments(*)')
		.eq('author_id', profileId)
		.order('created_at', { ascending: false })
	const posts = data?.map((post) => ({ ...post, author: Array.isArray(post.author) ? post.author[0] : post.author })) || []
	if (error) throw error.message

	return (
		<div className='space-y-2'>
			{posts.map((post) => (
				<Post key={post.id} post={post} />
			))}
		</div>
	)
}
