import { cn } from '@/lib/utils'
import { ComponentPropsWithoutRef } from 'react'

type HeadingProps = ComponentPropsWithoutRef<'h1'> & { variant?: 1 | 2 | 3 | 4 }

export default function Heading({ className, variant = 2, ...props }: HeadingProps) {
	const variantMap = {
		1: 'text-4xl font-bold',
		2: 'text-3xl font-bold',
		3: 'text-2xl font-semibold',
		4: 'text-lg font-semibold',
	}

	return <h1 className={cn('text-white', variantMap[variant], className)} {...props} />
}
