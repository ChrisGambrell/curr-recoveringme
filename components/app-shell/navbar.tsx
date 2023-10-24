import rme_icon from '@/assets/rme_icon.png'
import Image from 'next/image'
import UserNav from './user-nav'

export default function Navbar({ user }: { user: Profile }) {
	return (
		<div className='absolute top-0 left-0 z-10 flex w-full h-16 shadow-lg bg-muted'>
			<div className='flex items-center justify-center flex-shrink-0 w-20 h-16'>
				<Image src={rme_icon} alt='Recovering(Me)' width={36} height={36} />
			</div>
			<div className='flex items-center justify-end flex-1 px-4'>
				{/* TODO: Search button */}
				<UserNav user={user} />
			</div>
		</div>
	)
}
