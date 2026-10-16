import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { CustomizationProvider } from '../context/CustomizationContext';

export const metadata = {
  title: 'Veyra Chat — Real-Time Messaging & Direct Communication',
  description:
    'Veyra Chat is a high-performance, real-time messaging application with instant Socket.IO communication, phone number search, and external SMS dispatch.',
  keywords: 'veyra chat, messaging, real-time, socket.io, encrypted, sms gateway',
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
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-violet-600 selection:text-white flex flex-col">
        <CustomizationProvider>
          <AuthProvider>{children}</AuthProvider>
        </CustomizationProvider>
      </body>
    </html>
  );
}
