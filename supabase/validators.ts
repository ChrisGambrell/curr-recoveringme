import { z } from 'zod'
import WP_BP_ACTIVITY from './wp_data/wp_bp_activity.json'
import WP_BP_FRIENDS from './wp_data/wp_bp_friends.json'
import WP_USERSMETA from './wp_data/wp_usermeta.json'
import WP_USERS from './wp_data/wp_users.json'

export const wp_bp_activitySchema = z.object({
	id: z.number(),
	user_id: z.number(),
	type: z.string(),
	content: z.string(),
	item_id: z.number(),
	date_recorded: z.coerce.date(),
})
export const wp_bp_activity = wp_bp_activitySchema.array().parse(WP_BP_ACTIVITY)
export const wp_posts = wp_bp_activity.filter((a) => a.type === 'activity_update' && !!a.content.trim())
export const wp_comments = wp_bp_activity.filter((a) => a.type === 'activity_comment' && !!a.content.trim())

export const wp_bp_friendsSchema = z.object({
	id: z.number(),
	initiator_user_id: z.number(),
	friend_user_id: z.number(),
	is_confirmed: z.coerce.boolean(),
	date_created: z.coerce.date(),
})
export const wp_bp_friends = wp_bp_friendsSchema.array().parse(WP_BP_FRIENDS)

export const wp_usersSchema = z.object({
	ID: z.number(),
	user_login: z.string(),
	user_nicename: z.string(),
	user_email: z.string(),
	user_registered: z.coerce.date(),
	display_name: z.string(),
})
export const wp_users = wp_usersSchema
	.array()
	.parse(WP_USERS)
	.reduce(
		(prev, curr) => (!!prev.find((u) => u.user_nicename === curr.user_nicename) ? prev : prev.concat([curr])),
		[] as z.infer<typeof wp_usersSchema>[]
	)

export const wp_usersmetaSchema = z.object({ umeta_id: z.number(), user_id: z.number(), meta_key: z.string(), meta_value: z.string() })
export const wp_usersmeta = wp_usersmetaSchema.array().parse(WP_USERSMETA)
