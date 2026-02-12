// pages/_app.tsx - Wrapper principal avec AuthProvider

import { AppProps } from 'next/app';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import DemoBanner from '../components/DemoBanner';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <DemoBanner />
        <Navbar />
        <main>
          <Component {...pageProps} />
        </main>
      </div>
    </AuthProvider>
  );
}