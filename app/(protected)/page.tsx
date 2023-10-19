import H1 from '@/components/typography/h1'
import SignOutButton from './sign-out-button'

export default function HomePage() {
	return (
		<div className='space-y-4'>
			<H1>Hello! You are authenticated.</H1>
			<SignOutButton />
		</div>
	)
}
