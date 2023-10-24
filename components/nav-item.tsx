'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactElement, cloneElement } from 'react'

export type NavItemProps = { exact?: boolean; href: string; icon: ReactElement }

export default function NavItem({ exact, href, icon }: NavItemProps) {
	const pathname = usePathname()
	const isActive = exact ? pathname === href : pathname.startsWith(href)

	return (
		<Link
			className={cn(
				'w-14 h-14 flex items-center cursor-pointer justify-center rounded-lg',
				isActive ? 'bg-black/50 text-white' : 'bg-muted hover:bg-card text-white/70'
			)}
			href={href}>
			{cloneElement(icon, { className: 'w-5 h-5 stroke-[1.5]' })}
		</Link>
	)
}
