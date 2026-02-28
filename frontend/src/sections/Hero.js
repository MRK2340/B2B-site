import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Download } from 'lucide-react';

export function Hero() {
  return (
    <section data-testid="hero-section" className="relative min-h-[85vh] flex items-center overflow-hidden">
      <div
        className="absolute inset-0 animate-gradient-shift"
        style={{
          background: 'linear-gradient(135deg, #003D7A 0%, #0080C8 40%, #4DB8E8 70%, #FF8C00 100%)',
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                B2B PARTNERSHIP PORTAL
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              data-testid="hero-title"
            >
              Partner with iWhistle to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
                Elevate Your Officials
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-lg sm:text-xl text-white/90 mb-8 max-w-xl leading-relaxed"
            >
              Join our Pilot Program and give your basketball officials access to
              AI-powered rules assistance, video training, and mental wellness programming.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <a
                href="#pilot"
                data-testid="hero-cta-pilot"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-iwhistle-deep rounded-lg font-semibold transition-all duration-200 hover:bg-white/90 hover:scale-[1.02] hover:shadow-lg"
              >
                Explore Pilot Program
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#documents"
                data-testid="hero-cta-documents"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-lg font-semibold transition-all duration-200 hover:bg-white/20 hover:border-white/50"
              >
                <Download className="w-5 h-5" />
                Download Overview
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:flex justify-center items-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150" />
              <motion.img
                src="/images/hero-whistle.png"
                alt="iWhistle"
                className="relative z-10 w-full max-w-md drop-shadow-2xl"
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
