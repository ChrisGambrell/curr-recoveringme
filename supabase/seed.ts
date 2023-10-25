import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { Database } from '../lib/database.types'
import { wp_bp_activity, wp_bp_friends, wp_users, wp_usersmeta } from './validators'

dotenv.config({ path: '.env.local' })
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)
	throw new Error('Missing env variables for Supabase')
const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)

async function main() {
	const {
		data: { users: oldUsers },
	} = await supabase.auth.admin.listUsers({ perPage: 10000 })
	await Promise.all(oldUsers.map((u) => supabase.auth.admin.deleteUser(u.id)))
	await supabase.from('profiles').delete().neq('avatar_url', '')

	const userIdMap: { [key: number]: string } = {}
	await Promise.all(
		wp_users
			.filter(
				(u) =>
					u.user_email.endsWith('@stepworks.com') ||
					u.user_email.toLowerCase().includes('rich') ||
					u.user_email.toLowerCase().includes('hank') ||
					u.user_email.toLowerCase().includes('roy') ||
					u.user_email.toLowerCase().includes('chris')
			)
			.map(async (u) => {
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
			})
	)

	const { data: posts } = await supabase
		.from('posts')
		.insert(
			wp_bp_activity
				.filter((a) => a.type === 'activity_update' && Object.keys(userIdMap).includes(a.user_id.toString()))
				.map((a) => ({ id: a.id, created_at: a.date_recorded.toISOString(), body: a.content, user_id: userIdMap[a.user_id] }))
		)
		.select('id')

	await supabase.from('friends').insert(
		wp_bp_friends
			.filter(
				(f) =>
					Object.keys(userIdMap).includes(f.initiator_user_id.toString()) &&
					Object.keys(userIdMap).includes(f.friend_user_id.toString()) &&
					f.is_confirmed
			)
			.map((f) => ({
				id: f.id,
				created_at: f.date_created.toISOString(),
				initiator_id: userIdMap[f.initiator_user_id],
				friend_id: userIdMap[f.friend_user_id],
			}))
	)

	await supabase.from('comments').insert(
		wp_bp_activity
			.filter(
				(c) =>
					c.type === 'activity_comment' &&
					Object.keys(userIdMap).includes(c.user_id.toString()) &&
					posts?.map((p) => p.id).includes(c.item_id)
			)
			.map((c) => ({
				id: c.id,
				created_at: c.date_recorded.toISOString(),
				body: c.content,
				post_id: c.item_id,
				user_id: userIdMap[c.user_id],
			}))
	)
}

main()
