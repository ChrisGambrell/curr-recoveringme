'use client'

import { supabaseClient } from '@/lib/supabase.client'
import { useRouter } from 'next/navigation'
import { DropdownMenuItem } from '../ui/dropdown-menu'

export default function SignOutButton() {
	const router = useRouter()

	const handleSignOut = async () => {
		await supabaseClient.auth.signOut()
		router.refresh()
	}

	return <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
}
