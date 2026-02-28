import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';

export function ContactCTA() {
  return (
    <section id="contact" data-testid="contact-section" className="relative section-padding overflow-hidden">
      <div
        className="absolute inset-0 animate-gradient-shift"
        style={{
          background: 'linear-gradient(135deg, #0080C8 0%, #4DB8E8 50%, #FF8C00 100%)',
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

      <div className="relative z-10 max-w-4xl mx-auto container-padding text-center">
        <ScrollReveal>
          <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white mb-6">
            GET STARTED
          </span>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Elevate Your Officials?
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Schedule a discovery call to discuss your organization's needs and
            customize your pilot program.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.a
              href="mailto:partnerships@iwhistle.com?subject=Discovery%20Call%20Request"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-iwhistle-deep rounded-lg font-semibold transition-all duration-200 hover:bg-white/90 hover:shadow-lg"
              data-testid="contact-cta-button"
            >
              Schedule Discovery Call
              <ArrowRight className="w-5 h-5" />
            </motion.a>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="mt-8 flex items-center justify-center gap-2 text-white/80">
            <Mail className="w-5 h-5" />
            <span>Or email us at</span>
            <a
              href="mailto:partnerships@iwhistle.com"
              className="font-semibold text-white hover:underline"
              data-testid="contact-email-link"
            >
              partnerships@iwhistle.com
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
