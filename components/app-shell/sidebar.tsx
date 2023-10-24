import { HelpCircleIcon, HomeIcon, InboxIcon, LandmarkIcon, LaptopIcon, LifeBuoyIcon, Users2Icon } from 'lucide-react'
import NavItem, { NavItemProps } from '../nav-item'

const navLinks: NavItemProps[] = [
	// TODO: This page needs to be completed
	{ exact: true, href: '/', icon: <HomeIcon /> },
	// TODO: This page needs to be completed
	{ href: '/treatment', icon: <LifeBuoyIcon /> },
	// TODO: This page needs to be completed
	{ href: '/therapy', icon: <LaptopIcon /> },
	// TODO: This page needs to be completed
	{ href: '/groups', icon: <Users2Icon /> },
	// TODO: This page needs to be completed
	{ href: '/library', icon: <LandmarkIcon /> },
	// TODO: This page needs to be completed
	{ href: '/messages', icon: <InboxIcon /> },
	// TODO: This page needs to be completed
	{ href: '/help', icon: <HelpCircleIcon /> },
]

export default function Sidebar() {
	return (
		<div className='absolute top-0 left-0 flex flex-col items-center justify-center w-20 h-full pt-16 space-y-4 bg-muted'>
			{navLinks.map((item) => (
				<NavItem key={item.href} {...item} />
			))}
		</div>
	)
}
