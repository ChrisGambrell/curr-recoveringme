import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import SignOutButton from './sign-out-button'

export default function UserNav({ user }: { user: Profile }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='ghost' className='relative w-8 h-8 rounded-full'>
					<Avatar className='w-8 h-8'>
						<AvatarImage src={user.avatar_url} alt={user.display_name} />
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='w-56' align='end' forceMount>
				<DropdownMenuLabel className='font-normal'>
					<div className='flex flex-col space-y-1'>
						<p className='text-sm font-medium leading-none'>{user.display_name}</p>
						<p className='text-xs leading-none text-muted-foreground'>{user.email}</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem asChild>
						<Link href={`/profile/${user.username}`}>Profile</Link>
					</DropdownMenuItem>
					{/* TODO: This page needs to be completed */}
					<DropdownMenuItem>Billing</DropdownMenuItem>
					{/* TODO: This page needs to be completed */}
					<DropdownMenuItem>Settings</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<SignOutButton />
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
