import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { CustomizationProvider } from '../context/CustomizationContext';

export const metadata = {
  title: 'Veyra Chat — Real-Time Messaging & Direct Communication',
  description:
    'Veyra Chat is a high-performance, real-time messaging application with instant Socket.IO communication, phone number search, and external SMS dispatch.',
  keywords: 'veyra chat, messaging, real-time, socket.io, encrypted, sms gateway',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/images/iconlogo.jpeg', type: 'image/jpeg' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/images/iconlogo.jpeg',
    apple: [
      { url: '/images/iconlogo.jpeg', sizes: '180x180', type: 'image/jpeg' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Veyra Chat',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#090d16',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/images/iconlogo.jpeg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/images/iconlogo.jpeg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Veyra Chat" />
        <meta name="application-name" content="Veyra Chat" />
      </head>
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-violet-600 selection:text-white flex flex-col">
        <CustomizationProvider>
          <AuthProvider>{children}</AuthProvider>
        </CustomizationProvider>
      </body>
    </html>
  );
}
