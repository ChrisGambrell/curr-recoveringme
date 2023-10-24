import { getAuth } from '@/lib/supabase.server'
import type { ReactNode } from 'react'
import Navbar from './navbar'
import Sidebar from './sidebar'

export default async function AppShell({ children }: { children: ReactNode }) {
	const authedUser = await getAuth()

	return (
		<div className='relative w-screen h-screen'>
			<Navbar user={authedUser} />
			<div className='relative w-full h-full pt-16'>
				<Sidebar />
				<div className='w-full h-full pl-20'>{children}</div>
			</div>
		</div>
	)
}
