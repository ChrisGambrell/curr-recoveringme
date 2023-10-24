import { clsx, type ClassValue } from 'clsx'
import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { Database } from './database.types'

export type LayoutProps = { children: ReactNode }
export type Row<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}
