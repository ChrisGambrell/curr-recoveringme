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
	wp_bp_messages_messages,
	wp_bp_messages_recipients,
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

const BATCH_SIZE = 500

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
	await supabase.from('conversation_members').delete().gt('id', 0)
	await supabase.from('messages').delete().gt('id', 0)
	await supabase.from('conversations').delete().gt('id', 0)
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

async function seedConversationMembers(conversationMembers: { thread_id: number; user_id: number }[], bar: cliProgress.SingleBar) {
	const { data, error } = await supabase
		.from('conversation_members')
		.insert(conversationMembers.map((r) => ({ conversation_id: r.thread_id, user_id: userIdMap[r.user_id] })))
		.select('id')
	if (error) throw error.message
	bar.update(data?.length || 0)
	return data?.map((d) => d.id) || []
}

async function seedConversations(conversations: number[], bar: cliProgress.SingleBar) {
	const { data } = await supabase
		.from('conversations')
		.insert(conversations.map((c) => ({ id: c })))
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

async function seedMessages(messages: typeof wp_bp_messages_messages, bar: cliProgress.SingleBar) {
	const { data } = await supabase
		.from('messages')
		.insert(
			messages.map((m) => ({
				id: m.id,
				created_at: m.date_sent.toISOString(),
				conversation_id: m.thread_id,
				user_id: userIdMap[m.sender_id],
				body: m.message,
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

type CombinedThread = {
	threadId: number
	originalThreads: number[]
	users: number[]
}
function combineThreads(data: typeof wp_bp_messages_recipients): CombinedThread[] {
	const threadMap: Record<number, number[]> = {}
	const combinedThreads: Record<string, CombinedThread> = {}

	for (const item of data) {
		const { thread_id, user_id } = item
		if (!threadMap[thread_id]) threadMap[thread_id] = []
		threadMap[thread_id].push(user_id)
	}

	for (const threadId in threadMap) {
		const users = threadMap[threadId]
		const key = users.toString()

		if (combinedThreads[key]) combinedThreads[key].originalThreads.push(parseInt(threadId))
		else combinedThreads[key] = { threadId: parseInt(threadId), originalThreads: [parseInt(threadId)], users }
	}

	const result: CombinedThread[] = Object.values(combinedThreads)
	return result
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
	const conversations = combineThreads(wp_bp_messages_recipients.filter((r) => usersIncludes(r.user_id)))
	const friends = wp_bp_friends.filter((f) => usersIncludes(f.friend_user_id) && usersIncludes(f.initiator_user_id) && f.is_confirmed)
	const groups = wp_bp_groups
	const groupMembers = wp_bp_groups_members.filter((g) => usersIncludes(g.user_id) && !!groups.find((gg) => gg.id === g.group_id))
	const groupPosts = wp_group_posts.filter((g) => usersIncludes(g.user_id) && !!groups.find((gg) => gg.id === g.item_id))
	const messages = wp_bp_messages_messages.filter(
		(m) =>
			usersIncludes(m.sender_id) &&
			conversations.reduce((prev, curr) => prev.concat(curr.originalThreads), [] as number[]).includes(m.thread_id)
	)

	const bars = new cliProgress.MultiBar(
		{ clearOnComplete: false, hideCursor: true, format: ' {bar} | {table} | {percentage}% | {eta}s | {value}/{total}' },
		cliProgress.Presets.shades_grey
	)
	const postsBar = bars.create(posts.length, 0, { table: 'posts' })
	const commentsBar = bars.create(comments.length, 0, { table: 'comments' })
	const conversationMembersBar = bars.create(
		conversations.reduce((prev, curr) => prev + curr.originalThreads.length, 0),
		0,
		{ table: 'conversation_members' }
	)
	const conversationsBar = bars.create(conversations.length, 0, { table: 'conversations' })
	const friendsBar = bars.create(friends.length, 0, { table: 'friends' })
	const groupsBar = bars.create(groups.length, 0, { table: 'groups' })
	const groupMembersBar = bars.create(groupMembers.length, 0, { table: 'group_members' })
	const groupPostsBar = bars.create(groupPosts.length, 0, { table: 'group_posts' })
	const messagesBar = bars.create(messages.length, 0, { table: 'messages' })

	await seedPosts(posts, postsBar)
	await seedComments(comments, commentsBar)
	await seedConversations(
		conversations.map((c) => c.threadId),
		conversationsBar
	)
	await seedConversationMembers(
		conversations.reduce(
			(prev, curr) => prev.concat(curr.users.map((u) => ({ thread_id: curr.threadId, user_id: u }))),
			[] as { thread_id: number; user_id: number }[]
		),
		conversationMembersBar
	)
	await seedFriends(friends, friendsBar)
	await seedGroups(groups, groupsBar)
	await seedGroupMembers(groupMembers, groupMembersBar)
	await seedGroupPosts(groupPosts, groupPostsBar)
	await seedMessages(
		messages.map((m) => ({ ...m, thread_id: conversations.find((c) => c.originalThreads.includes(m.thread_id))!.threadId })),
		messagesBar
	)

	bars.stop()
}

main()
