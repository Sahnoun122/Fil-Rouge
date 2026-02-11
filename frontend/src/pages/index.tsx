// pages/index.tsx - Page d'accueil avec tous les composants landing

import Hero from '../../components/landing/Hero';
import Features from '../../components/landing/Features';
import HowItWorks from '../../components/landing/HowItWorks';
import SWOT from '../../components/landing/SWOT';
import Pricing from '../../components/landing/Pricing';
import FAQ from '../../components/landing/FAQ';
import Footer from '../../components/landing/Footer';

export default function HomePage() {
  return (
    <div>
      <Hero />
      <Features />
      <HowItWorks />
      <SWOT />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}