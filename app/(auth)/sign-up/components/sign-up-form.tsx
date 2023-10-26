'use client'

import Loading from '@/components/loading'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

const formSchema = z.object({
	first_name: z.string().min(1),
	last_name: z.string().min(1),
	display_name: z.string().min(1),
	username: z.string().min(1),
	email: z.string().email(),
	password: z.string().min(6),
	confirm_password: z.string().min(6),
})
type TForm = z.infer<typeof formSchema>

export default function SignUpForm() {
	const router = useRouter()
	const [loading, setLoading] = useState(false)

	const form = useForm<TForm>({
		resolver: zodResolver(formSchema),
		defaultValues: { first_name: '', last_name: '', display_name: '', username: '', email: '', password: '', confirm_password: '' },
	})

	const onSubmit = async (data: TForm) => {
		setLoading(true)

		if (data.password !== data.confirm_password) {
			setLoading(false)
			return toast.error('Passwords do not match')
		}

		const supabase = createClientComponentClient<Database>()

		const { data: existingUser, error: existingUserError } = await supabase.from('profiles').select().eq('username', data.username)
		if (existingUserError || existingUser.length > 0) {
			setLoading(false)
			return toast.error(existingUserError?.message || 'Username already taken')
		}

		const { error } = await supabase.auth.signUp({
			email: data.email,
			password: data.password,
			options: {
				data: {
					first_name: data.first_name,
					last_name: data.last_name,
					display_name: data.display_name,
					username: data.username,
					email: data.email,
				},
				emailRedirectTo: `${location.origin}/auth/callback`,
			},
		})

		if (error) toast.error(error.message)
		else {
			toast.success('Check your email to verify your account')
			router.push('/sign-in')
		}

		setLoading(false)
	}

	return (
		<Form {...form}>
			<form className='grid gap-4 sm:grid-cols-2' onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name='first_name'
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input placeholder='First name' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='last_name'
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input placeholder='Last name' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='display_name'
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input placeholder='Display name' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='username'
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input placeholder='Username' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='email'
					render={({ field }) => (
						<FormItem className='col-start-1 col-span-full'>
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
				<FormField
					control={form.control}
					name='confirm_password'
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input placeholder='Confirm password' type='password' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				{/* TODO: Text here */}
				{/* TODO: Checkbox */}
				<div className='flex flex-col space-y-4 sm:space-y-0 col-span-full sm:flex-row sm:items-center sm:justify-between'>
					<Button className='w-fit' disabled={loading} type='submit'>
						{loading ? <Loading /> : 'Sign up'}
					</Button>
					<Button asChild className='w-fit' variant='link'>
						<Link href='/sign-in'>I already have an account</Link>
					</Button>
				</div>
			</form>
		</Form>
	)
}
