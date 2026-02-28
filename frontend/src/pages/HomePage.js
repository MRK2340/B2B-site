import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Brain, Trophy, Users, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Rules Assistance',
    description: 'Give your officials instant, accurate answers to rules questions with our intelligent AI platform trained on official basketball rulebooks.',
  },
  {
    icon: Trophy,
    title: 'Video Training Library',
    description: 'Access a curated library of game film, instructional videos, and scenario-based training modules built specifically for basketball officials.',
  },
  {
    icon: Shield,
    title: 'Mental Wellness Programming',
    description: 'Support your officials with evidence-based mental wellness tools designed to help them perform under pressure and handle high-stress situations.',
  },
];

const stats = [
  { value: '500+', label: 'Officials Trained' },
  { value: '40+', label: 'Partner Organizations' },
  { value: '95%', label: 'Satisfaction Rate' },
  { value: '3x', label: 'Performance Improvement' },
];

const benefits = [
  'Reduce rules interpretation errors by up to 60%',
  'Improve officiating consistency across all levels',
  'Retain and develop officials with modern tools',
  'Access real-time performance analytics',
  'Flexible annual or seasonal subscription plans',
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white" data-testid="home-page">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-base">i</span>
              </div>
              <span className="font-bold text-xl text-iwhistle-deep">Whistle</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                data-testid="home-login-btn"
                className="px-5 py-2 text-sm font-medium text-iwhistle-deep border-2 border-iwhistle-deep rounded-lg hover:bg-iwhistle-deep hover:text-white transition-all duration-200"
              >
                Log In
              </Link>
              <Link
                to="/register"
                data-testid="home-register-btn"
                className="px-5 py-2 text-sm font-medium bg-iwhistle-blue text-white rounded-lg hover:bg-iwhistle-deep transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-16">
        <div
          className="absolute inset-0 animate-gradient-shift"
          style={{
            background: 'linear-gradient(135deg, #003D7A 0%, #0080C8 50%, #FF8C00 100%)',
            backgroundSize: '200% 200%',
          }}
        />
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white mb-6">
                B2B PARTNERSHIP PORTAL
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
              data-testid="home-hero-title"
            >
              Elevate Your Officials with{' '}
              <span className="text-iwhistle-orange">iWhistle</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-white/90 mb-10 max-w-2xl leading-relaxed"
            >
              The complete platform for basketball officiating excellence. Partner with iWhistle
              to give your officials access to AI-powered training, video libraries, and wellness
              programming — all under one roof.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/register"
                data-testid="hero-get-started-btn"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-iwhistle-deep rounded-lg font-semibold transition-all duration-200 hover:bg-white/90 hover:scale-[1.02] hover:shadow-lg"
              >
                Become a Partner
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                data-testid="hero-login-link"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-lg font-semibold transition-all duration-200 hover:bg-white/20"
              >
                Partner Login
              </Link>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L60 72C120 64 240 48 360 44C480 40 600 48 720 52C840 56 960 56 1080 56C1200 56 1320 52 1380 50L1440 48V80H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
                data-testid={`stat-${i}`}
              >
                <div className="text-4xl font-bold text-iwhistle-blue mb-2">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-1.5 bg-iwhistle-blue/10 text-iwhistle-blue rounded-full text-sm font-medium mb-4">
                ABOUT IWHISTLE
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-iwhistle-deep mb-6">
                Leadership Under Pressure
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                iWhistle is a technology platform built to support basketball officials at every level.
                We combine artificial intelligence, curated video content, and mental performance coaching
                to help officials make better calls, stay composed under pressure, and grow their careers.
              </p>
            </motion.div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                data-testid={`feature-card-${i}`}
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-iwhistle-deep mb-3">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Spotlight */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="inline-block px-4 py-1.5 bg-iwhistle-orange/10 text-iwhistle-orange rounded-full text-sm font-medium mb-4">
                PARTNER SPOTLIGHT
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-iwhistle-deep mb-4">
                Trusted by organizations across the nation
              </h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">
                See how iWhistle is transforming officiating programs at every level.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Our officials saw measurable improvement in their rules knowledge within the first month. The AI engine is genuinely impressive — it's like having an expert on call 24/7.",
                name: 'Sarah Johnson',
                title: 'Director of Officials',
                org: 'Mid-America Youth Basketball',
                initials: 'SJ',
                metric: '60% fewer rules disputes',
              },
              {
                quote: "The video training library transformed how we prepare referees for the postseason. iWhistle gives our officials a competitive edge that we simply couldn't build ourselves.",
                name: 'Marcus Williams',
                title: 'Executive Director',
                org: 'Capital City Officials Association',
                initials: 'MW',
                metric: '3x faster onboarding',
              },
              {
                quote: "Mental wellness programming has had a real impact on how our officials handle pressure in tight games. The retention improvement alone made the investment worthwhile.",
                name: 'Jennifer Park',
                title: 'Program Administrator',
                org: 'Pacific Northwest Officials Association',
                initials: 'JP',
                metric: '40% higher retention rate',
              },
            ].map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow"
                data-testid={`spotlight-card-${i}`}>
                <div className="flex-1">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, si) => (
                      <svg key={si} className="w-4 h-4 text-iwhistle-orange" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <blockquote className="text-gray-600 text-sm leading-relaxed mb-6 italic">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                </div>
                <div className="border-t border-gray-100 pt-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{t.initials}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-iwhistle-deep">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.title}, {t.org}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full whitespace-nowrap">{t.metric}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-1.5 bg-iwhistle-orange/10 text-iwhistle-orange rounded-full text-sm font-medium mb-4">
                WHY PARTNER WITH US
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-iwhistle-deep mb-6">
                Everything your organization needs to develop elite officials
              </h2>
              <ul className="space-y-4">
                {benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-iwhistle-deep to-iwhistle-blue rounded-3xl p-10 text-white"
            >
              <Users className="w-12 h-12 text-white/60 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
              <p className="text-white/80 mb-8 leading-relaxed">
                Join our growing network of basketball organizations. Create your partner account
                to access the full portal, review program documents, and submit your application.
              </p>
              <div className="space-y-3">
                <Link
                  to="/register"
                  data-testid="cta-register-btn"
                  className="block w-full text-center px-6 py-3 bg-white text-iwhistle-deep rounded-lg font-semibold hover:bg-white/90 transition-colors"
                >
                  Create Partner Account
                </Link>
                <Link
                  to="/login"
                  data-testid="cta-login-btn"
                  className="block w-full text-center px-6 py-3 bg-white/10 text-white border border-white/20 rounded-lg font-medium hover:bg-white/20 transition-colors"
                >
                  Already have an account? Log In
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-iwhistle-deep text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">i</span>
              </div>
              <span className="font-bold text-lg">Whistle</span>
            </div>
            <p className="text-white/50 text-sm">&copy; 2026 iWhistle, LLC. All rights reserved.</p>
            <a href="mailto:partnerships@iwhistle.com" className="text-white/60 hover:text-white text-sm transition-colors">
              partnerships@iwhistle.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
