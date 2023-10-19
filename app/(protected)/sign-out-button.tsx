'use client'

import { Button } from '@/components/ui/button'
import { supabaseClient } from '@/lib/supabase.client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
	const router = useRouter()

	const handleSignOut = async () => {
		await supabaseClient.auth.signOut()
		router.refresh()
	}

	return <Button onClick={handleSignOut}>Sign out</Button>
}
