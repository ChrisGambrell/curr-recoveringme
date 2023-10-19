import { isLoggedIn } from '@/lib/supabase.server'
import { LayoutProps } from '@/lib/utils'
import { redirect } from 'next/navigation'

export default async function AuthLayout({ children }: LayoutProps) {
	if (await isLoggedIn()) return redirect('/')
	return (
		<div className='w-screen h-screen bg-card'>
			<div className='mx-auto max-w-md pt-20'>{children}</div>
		</div>
	)
}
