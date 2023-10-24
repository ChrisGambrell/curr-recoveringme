/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{ protocol: 'https', hostname: 'api.dicebear.com', port: '', pathname: '/**' },
			{ protocol: 'https', hostname: 'app.recoveringme.com', port: '', pathname: '/wp-content/uploads/avatars/**' },
		],
	},
}

module.exports = nextConfig
