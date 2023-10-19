import H1 from '@/components/typography/h1'
import SignInForm from './components/sign-in-form'

export default function SignInPage() {
	return (
		<div className='space-y-4 w-full max-w-sm mx-auto'>
			<H1>Sign In</H1>
			{/* TODO: Forgot password page */}
			<SignInForm />
		</div>
	)
}
