'use client'

import Loading from '@/components/loading'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

const formSchema = z.object({ body: z.string().min(1) })
type TForm = z.infer<typeof formSchema>

export default function NewMessageForm({ conversation_id, sender_id }: { conversation_id: string; sender_id: string }) {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)

	const form = useForm<TForm>({ resolver: zodResolver(formSchema), defaultValues: { body: '' } })

	const onSubmit = async (data: TForm) => {
		setIsLoading(true)

		const supabase = createClientComponentClient<Database>()
		const { error } = await supabase.from('messages').insert({ ...data, conversation_id, sender_id })
		if (error) {
			setIsLoading(false)
			return toast.error(error.message)
		} else router.refresh()
	}

	return (
		<Form {...form}>
			<form className='flex items-center flex-shrink-0 space-x-2' onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name='body'
					render={({ field }) => (
						<FormItem className='flex-1'>
							<FormControl>
								<Input placeholder='Say something...' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button disabled={isLoading} type='submit' variant='outline'>
					{isLoading ? <Loading /> : 'Send'}
				</Button>
			</form>
		</Form>
	)
}
