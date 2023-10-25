'use client'

import Loading from '@/components/loading'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { supabaseClient } from '@/lib/supabase.client'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

const formSchema = z.object({ email: z.string().min(1), password: z.string().min(1) })
type TForm = z.infer<typeof formSchema>

export default function SignInForm() {
	const router = useRouter()
	const [loading, setLoading] = useState(false)

	const form = useForm<TForm>({ resolver: zodResolver(formSchema), defaultValues: { email: '', password: '' } })

	const onSubmit = async (data: TForm) => {
		setLoading(true)
		const { error } = await supabaseClient.auth.signInWithPassword(data)

		if (error) toast.error(error.message)
		else {
			router.refresh()
			router.push('/')
		}

		setLoading(false)
	}

	return (
		<Form {...form}>
			<form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name='email'
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input placeholder='Email address' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='password'
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input placeholder='Password' type='password' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className='flex items-center justify-between'>
					<Button disabled={loading} type='submit'>
						{loading ? <Loading /> : 'Sign in'}
					</Button>
					<Button asChild className='block' variant='link'>
						<Link href='/forgot-password'>Forgot password</Link>
					</Button>
				</div>
				<div className='ml-auto w-fit'>
					<Button asChild className='block' variant='link'>
						<Link href='/sign-up'>I don&apos;t have an account</Link>
					</Button>
				</div>
			</form>
		</Form>
	)
}
