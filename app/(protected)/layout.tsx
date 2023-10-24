import AppShell from '@/components/app-shell/app-shell'
import { isLoggedIn } from '@/lib/supabase.server'
import { LayoutProps } from '@/lib/utils'
import { redirect } from 'next/navigation'

export default async function ProtectedLayout({ children }: LayoutProps) {
	if (!(await isLoggedIn())) return redirect('/sign-in')
	return <AppShell>{children}</AppShell>
}
