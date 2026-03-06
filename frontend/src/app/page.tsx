import Navbar from '../../components/landing/Navbar';
import Hero from '../../components/landing/Hero';
import Problem from '../../components/landing/Problem';
import Solution from '../../components/landing/Solution';
import Features from '../../components/landing/Features';
import HowItWorks from '../../components/landing/HowItWorks';
import WhoIsItFor from '../../components/landing/WhoIsItFor';
import Benefits from '../../components/landing/Benefits';
import FinalCTA from '../../components/landing/FinalCTA';
import Footer from '../../components/landing/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      <Navbar />
      <Hero />
      <Problem />
      <Solution />
      <Features />
      <HowItWorks />
      <WhoIsItFor />
      <Benefits />
      <FinalCTA />
      <Footer />
    </main>
  );
}
