import { isLoggedIn } from '@/lib/supabase.server'
import { LayoutProps } from '@/lib/utils'
import { redirect } from 'next/navigation'

export default async function AuthLayout({ children }: LayoutProps) {
	if (await isLoggedIn()) return redirect('/')

	return (
		<div className='w-screen h-screen bg-card'>
			<div className='pt-12 md:pt-0 md:flex md:flex-col md:h-full md:justify-center mx-auto max-w-lg px-4'>{children}</div>
		</div>
	)
}
