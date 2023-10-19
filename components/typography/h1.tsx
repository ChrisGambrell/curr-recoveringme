import { cn } from '@/lib/utils'
import { ComponentPropsWithoutRef } from 'react'

export default function H1({ className, ...props }: ComponentPropsWithoutRef<'h1'>) {
	return <h1 className={cn('scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl', className)} {...props} />
}
