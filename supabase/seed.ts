import { createClient } from '@supabase/supabase-js'
import cliProgress from 'cli-progress'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { Database } from '../lib/database.types'
import { wp_bp_friends, wp_comments, wp_posts, wp_users, wp_usersmeta } from './validators'

dotenv.config({ path: '.env.local' })
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)
	throw new Error('Missing env variables for Supabase')
const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)

const userIdMap: { [key: number]: string } = {}
const users = wp_users.filter((u) => u.user_email.endsWith('@stepworks.com') || u.display_name.toLowerCase().includes('rich'))

const usersIncludes = (id: number) => Object.keys(userIdMap).includes(id.toString())

async function clearDatabase() {
	const {
		data: { users: oldUsers },
	} = await supabase.auth.admin.listUsers({ perPage: 10000 })

	const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
	bar.start(oldUsers.length, 0)

	for (const u of oldUsers) {
		await supabase.auth.admin.deleteUser(u.id)
		bar.increment()
	}

	bar.stop()

	await supabase.from('comments').delete().gt('id', 0)
	await supabase.from('friends').delete().gt('id', 0)
	await supabase.from('posts').delete().gt('id', 0)
	await supabase.from('profiles').delete().neq('avatar_url', '')
}

async function seedUsers(bar: cliProgress.SingleBar) {
	for (const u of users) {
		let avatar_url = null

		try {
			const files = fs.readdirSync(path.join(__dirname, `wp_data/rme_backup/wp-content/uploads/avatars/${u.ID}`))
			avatar_url =
				files.length > 0
					? `https://app.recoveringme.com/wp-content/uploads/avatars/${u.ID}/${
							files.find((f) => f.includes('bpfull')) ?? files[0]
					  }`
					: null
		} catch (err) {}

		const {
			data: { user },
		} = await supabase.auth.admin.createUser({
			email: u.user_email,
			password: 'Passw0rd!',
			user_metadata: {
				first_name: wp_usersmeta.find((m) => m.user_id === u.ID && m.meta_key === 'first_name')?.meta_value || '',
				last_name: wp_usersmeta.find((m) => m.user_id === u.ID && m.meta_key === 'last_name')?.meta_value || '',
				display_name: u.display_name,
				username: u.user_nicename,
				email: u.user_email,
				avatar_url,
				created_at: u.user_registered.toISOString(),
			},
			email_confirm: true,
		})

		if (user) userIdMap[u.ID] = user.id
		bar.increment()
	}
}

async function seedPosts(posts: typeof wp_posts, bar: cliProgress.SingleBar) {
	const { data } = await supabase
		.from('posts')
		.insert(posts.map((p) => ({ id: p.id, created_at: p.date_recorded.toISOString(), body: p.content, user_id: userIdMap[p.user_id] })))
		.select('id')
	bar.update(data?.length || 0)
}

async function seedComments(comments: typeof wp_comments, bar: cliProgress.SingleBar) {
	const { data } = await supabase
		.from('comments')
		.insert(
			comments.map((c) => ({
				id: c.id,
				created_at: c.date_recorded.toISOString(),
				body: c.content,
				post_id: c.item_id,
				user_id: userIdMap[c.user_id],
			}))
		)
		.select('id')
	bar.update(data?.length || 0)
}

async function seedFriends(friends: typeof wp_bp_friends, bar: cliProgress.SingleBar) {
	const { data } = await supabase
		.from('friends')
		.insert(
			friends.map((f) => ({
				id: f.id,
				created_at: f.date_created.toISOString(),
				initiator_id: userIdMap[f.initiator_user_id],
				friend_id: userIdMap[f.friend_user_id],
			}))
		)
		.select('id')
	bar.update(data?.length || 0)
}

async function main() {
	console.log('Clearing the database...')
	await clearDatabase()
	console.log('Seeding the database...')

	const usersBar = new cliProgress.SingleBar(
		{ format: ' {bar} | profiles | {percentage}% | {eta}s | {value}/{total}' },
		cliProgress.Presets.shades_grey
	)
	usersBar.start(users.length, 0)
	await seedUsers(usersBar)
	usersBar.stop()

	const posts = wp_posts.filter((p) => usersIncludes(p.user_id))
	const comments = wp_comments.filter((c) => usersIncludes(c.user_id) && posts.map((p) => p.id).includes(c.item_id))
	const friends = wp_bp_friends.filter((f) => usersIncludes(f.initiator_user_id) && usersIncludes(f.friend_user_id) && f.is_confirmed)

	const bars = new cliProgress.MultiBar(
		{ clearOnComplete: false, hideCursor: true, format: ' {bar} | {table} | {percentage}% | {eta}s | {value}/{total}' },
		cliProgress.Presets.shades_grey
	)
	const postsBar = bars.create(posts.length, 0, { table: 'posts' })
	const commentsBar = bars.create(comments.length, 0, { table: 'comments' })
	const friendsBar = bars.create(friends.length, 0, { table: 'friends' })

	await seedPosts(posts, postsBar)
	await seedComments(comments, commentsBar)
	await seedFriends(friends, friendsBar)

	bars.stop()
}

main()
