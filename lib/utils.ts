import { clsx, type ClassValue } from 'clsx'
import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export type LayoutProps = { children: ReactNode }

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}
