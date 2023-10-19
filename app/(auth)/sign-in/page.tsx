'use client'

import H1 from '@/components/typography/h1'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabaseClient } from '@/lib/supabase.client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function SignInPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const router = useRouter()

	const handleSignUp = async () => {
		const { error } = await supabaseClient.auth.signUp({
			email,
			password,
			options: { emailRedirectTo: `${location.origin}/auth/callback` },
		})
		if (error) return toast.error(error.message)
		router.refresh()
	}

	const handleSignIn = async () => {
		const { error } = await supabaseClient.auth.signInWithPassword({ email, password })
		if (error) return toast.error(error.message)
		router.push('/')
	}

	return (
		<div className='space-y-4'>
			<H1>Authentication</H1>
			<Input placeholder='Email address' value={email} onChange={(e) => setEmail(e.target.value)} />
			<Input placeholder='Password' type='password' value={password} onChange={(e) => setPassword(e.target.value)} />
			<div className='space-x-4'>
				<Button onClick={handleSignUp}>Sign up</Button>
				<Button onClick={handleSignIn}>Sign in</Button>
			</div>
		</div>
	)
}
