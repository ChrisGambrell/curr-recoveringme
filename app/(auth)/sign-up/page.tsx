import H1 from '@/components/typography/h1'
import SignUpForm from './components/sign-up-form'

export default function SignUpPage() {
	return (
		<div className='space-y-4'>
			<H1>Create an Account</H1>
			<SignUpForm />
		</div>
	)
}
