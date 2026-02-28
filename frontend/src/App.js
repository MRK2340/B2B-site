import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './sections/Navbar';
import { Hero } from './sections/Hero';
import { PartnershipOverview } from './sections/PartnershipOverview';
import { PilotProgram } from './sections/PilotProgram';
import { SuccessMetrics } from './sections/SuccessMetrics';
import { Documents } from './sections/Documents';
import { PartnershipForm } from './sections/PartnershipForm';
import { ContactCTA } from './sections/ContactCTA';
import { Footer } from './sections/Footer';
import { AdminDashboard } from './sections/AdminDashboard';
import './App.css';

function MainSite() {
  return (
    <div className="min-h-screen bg-white" data-testid="app-container">
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainSite />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
