import { Navbar } from '@/sections/Navbar';
import { Hero } from '@/sections/Hero';
import { PartnershipOverview } from '@/sections/PartnershipOverview';
import { PilotProgram } from '@/sections/PilotProgram';
import { SuccessMetrics } from '@/sections/SuccessMetrics';
import { Documents } from '@/sections/Documents';
import { PartnershipForm } from '@/sections/PartnershipForm';
import { ContactCTA } from '@/sections/ContactCTA';
import { Footer } from '@/sections/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <PartnershipOverview />
        <PilotProgram />
        <SuccessMetrics />
        <Documents />
        <PartnershipForm />
        <ContactCTA />
      </main>
      <Footer />
    </div>
  );
}

export default App;
