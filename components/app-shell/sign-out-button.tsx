'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { DropdownMenuItem } from '../ui/dropdown-menu'

export default function SignOutButton() {
	const router = useRouter()

	const handleSignOut = async () => {
		const supabase = createClientComponentClient<Database>()
		await supabase.auth.signOut()
		router.refresh()
	}

	return <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
}
