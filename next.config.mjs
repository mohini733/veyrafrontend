/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      { source: '/settings.html', destination: '/settings' },
      { source: '/chats.html', destination: '/chats' },
      { source: '/profile.html', destination: '/profile' },
      { source: '/login.html', destination: '/login' },
      { source: '/signup.html', destination: '/signup' },
      { source: '/sms.html', destination: '/sms' },
      { source: '/forgot-password.html', destination: '/forgot-password' },
      { source: '/:path*.html', destination: '/:path*' },
    ];
  },
};

export default nextConfig;
