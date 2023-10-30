import { createClient } from '@supabase/supabase-js'
import cliProgress from 'cli-progress'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { Database } from '../lib/database.types'
import {
	IdMap,
	combinedConversations,
	wp_comments,
	wp_friends,
	wp_group_members,
	wp_group_posts,
	wp_groups,
	wp_messages,
	wp_posts,
	wp_users,
} from './validators'

dotenv.config({ path: '.env.local' })
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)
	throw new Error('Missing env variables for Supabase')
const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)

const BATCH_SIZE = 1000

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

	await supabase.from('group_members').delete().gt('created_at', new Date('1970-01-01').toISOString())
	await supabase.from('group_posts').delete().gt('created_at', new Date('1970-01-01').toISOString())
	await supabase.from('groups').delete().gt('wp_id', 0)

	await supabase.from('conversation_members').delete().gt('created_at', new Date('1970-01-01').toISOString())
	await supabase.from('messages').delete().gt('created_at', new Date('1970-01-01').toISOString())
	await supabase.from('conversations').delete().gt('wp_id', 0)

	await supabase.from('comments').delete().gt('created_at', new Date('1970-01-01').toISOString())
	await supabase.from('posts').delete().gt('wp_id', 0)

	await supabase.from('friends').delete().gt('created_at', new Date('1970-01-01').toISOString())
	await supabase.from('profiles').delete().neq('avatar_url', '')
}

async function seedUsers(users: typeof wp_users) {
	const userIds: IdMap = {}
	const bar = new cliProgress.SingleBar(
		{ format: ' {bar} | profiles | {percentage}% | {eta}s | {value}/{total}' },
		cliProgress.Presets.shades_grey
	)
	bar.start(users.length, 0)

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

				await supabase.auth.admin
					.createUser({
						email: u.email,
						password: 'Passw0rd!',
						user_metadata: { ...u, avatar_url: avatar_url || undefined },
						email_confirm: true,
					})
					.then(({ data: { user } }) => {
						if (user) userIds[u.ID] = user.id
						bar.increment()
					})
			})
		)

	bar.stop()
	return userIds
}

async function main() {
	console.log('Clearing the database...')
	await clearDatabase()
	console.log('Seeding the database...')

	const users = wp_users //.filter((u) => u.email.endsWith('@stepworks.com') || u.display_name.toLowerCase().includes('rich'))
	const userIds = await seedUsers(users)

	const friends = wp_friends(userIds)
	await supabase.from('friends').insert(friends).select('id')

	const posts = wp_posts(userIds)
	const postIds: IdMap = await supabase
		.from('posts')
		.insert(posts)
		.select('id, wp_id')
		.then(({ data }) => data?.reduce((prev, curr) => ({ ...prev, [curr.wp_id]: curr.id }), {}) || {})

	const comments = wp_comments(userIds, postIds)
	await supabase.from('comments').insert(comments)

	const groups = wp_groups(userIds)
	const groupIds: IdMap = await supabase
		.from('groups')
		.insert(groups)
		.select('id, wp_id')
		.then(({ data }) => data?.reduce((prev, curr) => ({ ...prev, [curr.wp_id]: curr.id }), {}) || {})

	const group_members = wp_group_members(userIds, groupIds)
	const groupMemberIds = await supabase
		.from('group_members')
		.insert(group_members)
		.select('group_id, member_id')
		.then(
			({ data }) =>
				data?.reduce(
					(prev, curr) =>
						!!prev[curr.group_id]
							? { ...prev, [curr.group_id]: prev[curr.group_id].concat([curr.member_id]) }
							: { ...prev, [curr.group_id]: [curr.member_id] },
					{} as { [key: string]: string[] }
				) || {}
		)

	const group_posts = wp_group_posts(userIds, groupIds, groupMemberIds)
	await supabase.from('group_posts').insert(group_posts)

	const combined_conversations = combinedConversations(userIds).filter((c) => c.users.length > 1)

	const conversations = combined_conversations.map((c) => ({ wp_id: c.threadId }))
	const conversationIds: IdMap = await supabase
		.from('conversations')
		.insert(conversations)
		.select('id, wp_id')
		.then(({ data }) => data?.reduce((prev, curr) => ({ ...prev, [curr.wp_id]: curr.id }), {}) || {})

	const conversation_members = combined_conversations.reduce(
		(prev, curr) => prev.concat(curr.users.map((u) => ({ conversation_id: conversationIds[curr.threadId], member_id: userIds[u] }))),
		[] as { conversation_id: string; member_id: string }[]
	)
	await supabase.from('conversation_members').insert(conversation_members)

	const messages = wp_messages(userIds, conversationIds, combined_conversations)
	await supabase.from('messages').insert(messages)
}

main()
