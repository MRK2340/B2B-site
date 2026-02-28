import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Shield, Scale, Lock, Download } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/ScrollReveal';

const documents = [
  {
    icon: FileText,
    title: 'Pilot Program Agreement',
    description: 'Complete terms and conditions for the pilot program including structure, pricing, and partner responsibilities.',
    href: '#',
    color: 'from-iwhistle-blue to-iwhistle-light',
  },
  {
    icon: Shield,
    title: 'Data Processing Agreements',
    description: 'GDPR Article 28 and CCPA compliant processing terms for all vendor relationships.',
    href: '#',
    color: 'from-iwhistle-light to-iwhistle-orange',
  },
  {
    icon: Scale,
    title: 'Terms of Service',
    description: 'Platform terms governing access and use of iWhistle services for organizations.',
    href: '#',
    color: 'from-iwhistle-orange to-iwhistle-burnt',
  },
  {
    icon: Lock,
    title: 'Privacy Policy',
    description: 'Detailed information on how we collect, use, and protect personal data.',
    href: '#',
    color: 'from-iwhistle-deep to-iwhistle-blue',
  },
];

export function Documents() {
  return (
    <section id="documents" data-testid="documents-section" className="section-padding bg-iwhistle-deep">
      <div className="max-w-7xl mx-auto container-padding">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-white/10 text-white rounded-full text-sm font-medium mb-4">
            DOCUMENTATION
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Partnership Documents
          </h2>
          <p className="text-lg text-white/80 leading-relaxed">
            Access all the legal agreements and documentation needed to establish
            a partnership with iWhistle.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
          {documents.map((doc) => (
            <StaggerItem key={doc.title}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className="group h-full bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-iwhistle-light/50 transition-all duration-300"
                data-testid={`doc-card-${doc.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${doc.color} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300`}>
                  <doc.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{doc.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-6">{doc.description}</p>
                <motion.a
                  href={doc.href}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                  data-testid={`download-${doc.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </motion.a>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <ScrollReveal delay={0.4} className="mt-12 text-center">
          <p className="text-white/60 text-sm">
            All documents are regularly updated. Please ensure you have the latest version before signing.
            <br />
            For questions about any document, contact us at{' '}
            <a href="mailto:legal@iwhistle.com" className="text-iwhistle-light hover:underline">
              legal@iwhistle.com
            </a>
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
