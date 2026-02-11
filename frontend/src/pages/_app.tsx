// pages/_app.tsx - Wrapper principal avec AuthProvider

import { AppProps } from 'next/app';
import { AuthProvider } from '../src/context/AuthContext';
import Navbar from '../src/components/Navbar';
import '../app/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Component {...pageProps} />
        </main>
      </div>
    </AuthProvider>
  );
}