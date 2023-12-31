import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = { title: 'Recovering(Me)' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en'>
			<body className='dark'>
				<Toaster />
				{children}
			</body>
		</html>
	)
}
