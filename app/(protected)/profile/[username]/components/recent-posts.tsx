import Post from '@/components/post'
import { supabaseServer } from '@/lib/supabase.server'

export default async function RecentPosts({ profileId }: { profileId: string }) {
	const { data } = await supabaseServer
		.from('posts')
		.select('*, author:profiles(*)')
		.eq('user_id', profileId)
		.order('created_at', { ascending: false })
	const posts = data?.map((post) => ({ ...post, author: Array.isArray(post.author) ? post.author[0] : post.author })) || []

	return (
		<div className='space-y-2'>
			{posts.map((post) => (
				<Post key={post.id} post={post} />
			))}
		</div>
	)
}
