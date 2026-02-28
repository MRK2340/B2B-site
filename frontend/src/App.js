import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PartnerDashboard from './pages/PartnerDashboard';
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

function PartnerPortal() {
  return (
    <div className="min-h-screen bg-white" data-testid="partner-portal">
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
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/portal"
            element={
              <ProtectedRoute>
                <PartnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
