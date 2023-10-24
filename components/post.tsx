import dayjs from 'dayjs'
import { MessageCircleIcon, MoreVerticalIcon, PencilIcon, ThumbsUpIcon, TrashIcon } from 'lucide-react'
import Image from 'next/image'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'

export default function Post({ post }: { post: PostWithAuthor }) {
	return (
		<div className='px-4 py-6 space-y-4 text-sm rounded-lg bg-card'>
			<div className='flex items-start'>
				<div className='flex items-center flex-1 space-x-3'>
					<Image className='rounded-full' src={post.author.avatar_url} alt={post.author.display_name} width={40} height={40} />
					<div className='-space-y-0.5'>
						{/* TODO: Make this linkable */}
						<div className='inline font-semibold cursor-pointer hover:underline'>{post.author.display_name}</div>
						<div className='text-foreground/50'>{dayjs(post.created_at).format('MMM. D, YYYY [a]t h:mma')}</div>
					</div>
				</div>
				<div className='flex-shrink-0'>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<MoreVerticalIcon className='w-5 h-5 cursor-pointer text-foreground/50 hover:text-foreground/75' />
						</DropdownMenuTrigger>
						<DropdownMenuContent className='w-48' align='end' forceMount>
							<DropdownMenuGroup>
								{/* TODO: Need to add action */}
								<DropdownMenuItem>
									<PencilIcon className='w-3 h-3 mr-2' />
									Edit post
								</DropdownMenuItem>
								{/* TODO: Need to add action */}
								<DropdownMenuItem>
									<TrashIcon className='w-3 h-3 mr-2' />
									Delete post
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
			<div>{post.body}</div>
			<div className='flex items-center space-x-6 text-foreground/50'>
				{/* TODO: Add action and display correct number */}
				<div className='flex items-center'>
					<ThumbsUpIcon className='w-5 h-5 mr-2' />0
				</div>
				{/* TODO: Add action and display correct number */}
				<div className='flex items-center'>
					<MessageCircleIcon className='w-5 h-5 mr-2' />0
				</div>
			</div>
		</div>
	)
}
