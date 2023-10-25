import { createClient } from '@supabase/supabase-js'
import cliProgress from 'cli-progress'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { Database } from '../lib/database.types'
import {
	wp_bp_activity,
	wp_bp_friends,
	wp_bp_groups,
	wp_bp_groups_members,
	wp_comments,
	wp_group_posts,
	wp_posts,
	wp_users,
	wp_usersmeta,
} from './validators'

dotenv.config({ path: '.env.local' })
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)
	throw new Error('Missing env variables for Supabase')
const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)

const BATCH_SIZE = 1000

const userIdMap: { [key: number]: string } = {}
// const users = wp_users.filter((u) => u.user_email.endsWith('@stepworks.com') || u.display_name.toLowerCase().includes('rich'))
const users = wp_users.filter(
	(u) =>
		wp_bp_friends.map((f) => f.friend_user_id).includes(u.ID) ||
		wp_bp_friends.map((f) => f.initiator_user_id).includes(u.ID) ||
		wp_bp_groups_members.map((g) => g.user_id).includes(u.ID) ||
		wp_group_posts.map((g) => g.user_id).includes(u.ID) ||
		wp_bp_groups.map((g) => g.creator_id).includes(u.ID) ||
		wp_comments.map((c) => c.user_id).includes(u.ID) ||
		wp_posts.map((p) => p.user_id).includes(u.ID)
)

const usersIncludes = (id: number) => Object.keys(userIdMap).includes(id.toString())

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
	return Array.from({ length: Math.ceil(array.length / chunkSize) }, (_, index) =>
		array.slice(index * chunkSize, (index + 1) * chunkSize)
	)
}

async function clearDatabase() {
	const {
		data: { users: oldUsers },
	} = await supabase.auth.admin.listUsers({ perPage: 100000 })

	const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
	bar.start(oldUsers.length, 0)

	for (const chunk of chunkArray(oldUsers, BATCH_SIZE))
		await Promise.all(chunk.map((u) => supabase.auth.admin.deleteUser(u.id).then(() => bar.increment())))

	bar.stop()

	await supabase.from('comments').delete().gt('id', 0)
	await supabase.from('friends').delete().gt('id', 0)
	await supabase.from('group_posts').delete().gt('id', 0)
	await supabase.from('group_members').delete().gt('id', 0)
	await supabase.from('groups').delete().gt('id', 0)
	await supabase.from('posts').delete().gt('id', 0)
	await supabase.from('profiles').delete().neq('avatar_url', '')
}

async function seedComments(comments: typeof wp_comments, bar: cliProgress.SingleBar) {
	const { data } = await supabase
		.from('comments')
		.insert(
			comments.map((c) => ({
				id: c.id,
				created_at: c.date_recorded.toISOString(),
				body: c.content,
				post_id: c.item_id!,
				user_id: userIdMap[c.user_id],
			}))
		)
		.select('id')
	bar.update(data?.length || 0)
	return data?.map((d) => d.id) || []
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
	return data?.map((d) => d.id) || []
}

async function seedGroupMembers(groupsMembers: typeof wp_bp_groups_members, bar: cliProgress.SingleBar) {
	const { data } = await supabase
		.from('group_members')
		.insert(
			groupsMembers.map((g) => ({
				id: g.id,
				created_at: g.date_modified.toISOString(),
				group_id: g.group_id,
				user_id: userIdMap[g.user_id],
				inviter_id: userIdMap[g.inviter_id || '-1'] || null,
				is_admin: g.is_admin,
				is_mod: g.is_mod,
				user_title: g.user_title,
				comments: g.comments,
				is_confirmed: g.is_confirmed,
				is_banned: g.is_banned,
				invite_sent: g.invite_sent,
			}))
		)
		.select('id')
	bar.update(data?.length || 0)
	return data?.map((d) => d.id) || []
}

async function seedGroupPosts(groupPosts: typeof wp_bp_activity, bar: cliProgress.SingleBar) {
	const { data } = await supabase
		.from('group_posts')
		.insert(
			groupPosts.map((g) => ({
				id: g.id,
				created_at: g.date_recorded.toISOString(),
				group_id: g.item_id!,
				user_id: userIdMap[g.user_id],
				body: g.content,
			}))
		)
		.select('id')
	bar.update(data?.length || 0)
	return data?.map((d) => d.id) || []
}

async function seedGroups(groups: typeof wp_bp_groups, bar: cliProgress.SingleBar) {
	const { data } = await supabase
		.from('groups')
		.insert(
			groups.map((g) => ({
				id: g.id,
				created_at: g.date_created.toISOString(),
				user_id: userIdMap[g.creator_id] || null,
				name: g.name,
				slug: g.slug,
				description: g.description,
				status: g.status,
			}))
		)
		.select('id')
	bar.update(data?.length || 0)
	return data?.map((d) => d.id) || []
}

async function seedPosts(posts: typeof wp_posts, bar: cliProgress.SingleBar) {
	const { data } = await supabase
		.from('posts')
		.insert(posts.map((p) => ({ id: p.id, created_at: p.date_recorded.toISOString(), body: p.content, user_id: userIdMap[p.user_id] })))
		.select('id')
	bar.update(data?.length || 0)
	return data?.map((d) => d.id) || []
}

async function seedUsers(bar: cliProgress.SingleBar) {
	for (const chunk of chunkArray(users, BATCH_SIZE))
		await Promise.all(
			chunk.map(async (u) => {
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
			})
		)
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
	const comments = wp_comments.filter((c) => usersIncludes(c.user_id) && !!posts.find((p) => p.id === c.item_id))
	const friends = wp_bp_friends.filter((f) => usersIncludes(f.friend_user_id) && usersIncludes(f.initiator_user_id) && f.is_confirmed)
	const groups = wp_bp_groups
	const groupMembers = wp_bp_groups_members.filter((g) => usersIncludes(g.user_id) && !!groups.find((gg) => gg.id === g.group_id))
	const groupPosts = wp_group_posts.filter((g) => usersIncludes(g.user_id) && !!groups.find((gg) => gg.id === g.item_id))

	const bars = new cliProgress.MultiBar(
		{ clearOnComplete: false, hideCursor: true, format: ' {bar} | {table} | {percentage}% | {eta}s | {value}/{total}' },
		cliProgress.Presets.shades_grey
	)
	const postsBar = bars.create(posts.length, 0, { table: 'posts' })
	const commentsBar = bars.create(comments.length, 0, { table: 'comments' })
	const friendsBar = bars.create(friends.length, 0, { table: 'friends' })
	const groupsBar = bars.create(groups.length, 0, { table: 'groups' })
	const groupMembersBar = bars.create(groupMembers.length, 0, { table: 'group_members' })
	const groupPostsBar = bars.create(groupPosts.length, 0, { table: 'group_members' })

	await seedPosts(posts, postsBar)
	await seedComments(comments, commentsBar)
	await seedFriends(friends, friendsBar)
	await seedGroups(groups, groupsBar)
	await seedGroupMembers(groupMembers, groupMembersBar)
	await seedGroupPosts(groupPosts, groupPostsBar)

	bars.stop()
}

main()
