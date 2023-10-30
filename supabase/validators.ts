import { z } from 'zod'
import WP_FRIENDS from './wp_data/wp_bp_friends.json'
import WP_COMMENTS from './wp_data/wp_comments.json'
import WP_CONVERSATION_MEMBERS from './wp_data/wp_conversation_members.json'
import WP_GROUP_MEMBERS from './wp_data/wp_group_members.json'
import WP_GROUP_POSTS from './wp_data/wp_group_posts.json'
import WP_GROUPS from './wp_data/wp_groups.json'
import WP_MESSAGES from './wp_data/wp_messages.json'
import WP_POSTS from './wp_data/wp_posts.json'
import WP_USERS from './wp_data/wp_users.json'

export type IdMap = { [key: number]: string }
type CombinedThread = {
	threadId: number
	originalThreads: number[]
	users: number[]
}

function combineThreads(data: typeof WP_CONVERSATION_MEMBERS, userIds: IdMap): CombinedThread[] {
	const threadMap: Record<number, number[]> = {}
	const combinedThreads: Record<string, CombinedThread> = {}

	for (const item of data.sort((a, b) => a.member_id - b.member_id)) {
		const { conversation_id, member_id } = item
		if (!userIds[member_id]) continue

		if (!threadMap[conversation_id]) threadMap[conversation_id] = []
		threadMap[conversation_id].push(member_id)
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

export const userSchema = z.object({
	ID: z.number(),
	first_name: z
		.string()
		.nullable()
		.transform((arg) => arg || ''),
	last_name: z
		.string()
		.nullable()
		.transform((arg) => arg || ''),
	display_name: z.string(),
	username: z.string(),
	email: z.string(),
	created_at: z.coerce.date().transform((arg) => arg.toISOString()),
})
export const wp_users = userSchema
	.array()
	.parse(
		WP_USERS.filter(
			(u) =>
				!!WP_FRIENDS.find((f) => f.friend_id === u.ID || f.initiator_id === u.ID) ||
				!!WP_POSTS.find((f) => f.author_id === u.ID) ||
				!!WP_COMMENTS.find((f) => f.author_id === u.ID) ||
				!!WP_GROUPS.find((f) => f.owner_id === u.ID) ||
				!!WP_GROUP_MEMBERS.find((f) => f.member_id === u.ID) ||
				!!WP_GROUP_POSTS.find((f) => f.author_id === u.ID) ||
				!!WP_CONVERSATION_MEMBERS.find((f) => f.member_id === u.ID) ||
				!!WP_MESSAGES.find((f) => f.sender_id === u.ID)
		)
	)

export const friendSchema = (userIds: IdMap) =>
	z.object({
		friend_id: z.number().transform((arg) => userIds[arg]),
		initiator_id: z.number().transform((arg) => userIds[arg]),
		created_at: z.coerce.date().transform((arg) => arg.toISOString()),
	})
export const wp_friends = (userIds: IdMap) =>
	friendSchema(userIds)
		.array()
		.parse(WP_FRIENDS.filter((f) => !!userIds[f.friend_id] && !!userIds[f.initiator_id]))

export const postSchema = (userIds: IdMap) =>
	z.object({
		wp_id: z.number(),
		author_id: z.number().transform((arg) => userIds[arg]),
		body: z.string(),
		created_at: z.coerce.date().transform((arg) => arg.toISOString()),
	})
export const wp_posts = (userIds: IdMap) =>
	postSchema(userIds)
		.array()
		.parse(WP_POSTS.filter((p) => !!userIds[p.author_id]))

export const commentSchema = (userIds: IdMap, postIds: IdMap) =>
	z.object({
		author_id: z.number().transform((arg) => userIds[arg]),
		post_id: z.number().transform((arg) => postIds[arg]),
		body: z.string(),
		created_at: z.coerce.date().transform((arg) => arg.toISOString()),
	})
export const wp_comments = (userIds: IdMap, postIds: IdMap) =>
	commentSchema(userIds, postIds)
		.array()
		.parse(WP_COMMENTS.filter((c) => !!userIds[c.author_id] && !!postIds[c.post_id]))

export const groupSchema = (userIds: IdMap) =>
	z.object({
		wp_id: z.number(),
		owner_id: z.number().transform((arg) => userIds[arg]),
		name: z.string(),
		slug: z.string(),
		description: z.string(),
		status: z.enum(['hidden', 'private', 'public']),
	})
export const wp_groups = (userIds: IdMap) =>
	groupSchema(userIds)
		.array()
		.parse(WP_GROUPS.filter((g) => !!userIds[g.owner_id]))

export const groupMemberSchema = (userIds: IdMap, groupIds: IdMap) =>
	z.object({
		group_id: z.number().transform((arg) => groupIds[arg]),
		member_id: z.number().transform((arg) => userIds[arg]),
		created_at: z.coerce.date().transform((arg) => arg.toISOString()),
	})
export const wp_group_members = (userIds: IdMap, groupIds: IdMap) =>
	groupMemberSchema(userIds, groupIds)
		.array()
		.parse(WP_GROUP_MEMBERS.filter((m) => !!userIds[m.member_id] && !!groupIds[m.group_id]))

export const groupPostSchema = (userIds: IdMap, groupIds: IdMap) =>
	z.object({
		author_id: z.number().transform((arg) => userIds[arg]),
		group_id: z.number().transform((arg) => groupIds[arg]),
		body: z.string(),
		created_at: z.coerce.date().transform((arg) => arg.toISOString()),
	})
export const wp_group_posts = (userIds: IdMap, groupIds: IdMap, groupMemberIds: { [key: string]: string[] }) =>
	groupPostSchema(userIds, groupIds)
		.array()
		.parse(
			WP_GROUP_POSTS.filter(
				(p) =>
					!!userIds[p.author_id] && !!groupIds[p.group_id] && groupMemberIds[groupIds[p.group_id]].includes(userIds[p.author_id])
			)
		)

export const combinedConversations = (userIds: IdMap) => combineThreads(WP_CONVERSATION_MEMBERS, userIds)

export const conversationSchema = z.object({ conversation_id: z.number() })
export const wp_conversations = conversationSchema
	.array()
	.parse(WP_CONVERSATION_MEMBERS)
	.reduce(
		(prev, curr) => (!!prev.find((p) => p.wp_id === curr.conversation_id) ? prev : prev.concat([{ wp_id: curr.conversation_id }])),
		[] as { wp_id: number }[]
	)

export const conversationMemberSchema = (userIds: IdMap, conversationIds: IdMap) =>
	z.object({
		conversation_id: z.number().transform((arg) => conversationIds[arg]),
		member_id: z.number().transform((arg) => userIds[arg]),
	})
export const wp_conversation_members = (userIds: IdMap, conversationIds: IdMap) =>
	conversationMemberSchema(userIds, conversationIds)
		.array()
		.parse(WP_CONVERSATION_MEMBERS.filter((m) => !!userIds[m.member_id] && !!conversationIds[m.conversation_id]))

export const messageSchema = (userIds: IdMap, conversationIds: IdMap, combinedConversations: CombinedThread[]) =>
	z.object({
		conversation_id: z
			.number()
			.transform((arg) => conversationIds[combinedConversations.find((c) => c.originalThreads.includes(arg))?.threadId || '-1']),
		sender_id: z.number().transform((arg) => userIds[arg]),
		body: z.string(),
		created_at: z.coerce.date().transform((arg) => arg.toISOString()),
	})
export const wp_messages = (userIds: IdMap, conversationIds: IdMap, combinedConversations: CombinedThread[]) =>
	messageSchema(userIds, conversationIds, combinedConversations)
		.array()
		.parse(
			WP_MESSAGES.filter(
				(m) =>
					!!userIds[m.sender_id] &&
					!!conversationIds[combinedConversations.find((c) => c.originalThreads.includes(m.conversation_id))?.threadId || '-1']
			)
		)
