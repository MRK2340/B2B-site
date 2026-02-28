import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Shield, Scale, Lock, Download, Eye } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/ScrollReveal';
import { DocumentViewer } from '../components/DocumentViewer';
import { documentContent } from '../data/documentContent';
import { jsPDF } from 'jspdf';

const documents = [
  {
    icon: FileText,
    title: 'Pilot Program Agreement',
    slug: 'pilot-program-agreement',
    description: 'Complete terms and conditions for the pilot program including structure, pricing, and partner responsibilities.',
    color: 'from-iwhistle-blue to-iwhistle-light',
  },
  {
    icon: Shield,
    title: 'Data Processing Agreements',
    slug: 'data-processing-agreements',
    description: 'GDPR Article 28 and CCPA compliant processing terms for all vendor relationships.',
    color: 'from-iwhistle-light to-iwhistle-orange',
  },
  {
    icon: Scale,
    title: 'Terms of Service',
    slug: 'terms-of-service',
    description: 'Platform terms governing access and use of iWhistle services for organizations.',
    color: 'from-iwhistle-orange to-iwhistle-burnt',
  },
  {
    icon: Lock,
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    description: 'Detailed information on how we collect, use, and protect personal data.',
    color: 'from-iwhistle-deep to-iwhistle-blue',
  },
];

function generateDocPdf(content) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  doc.setFillColor(0, 61, 122);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('iWhistle', margin, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(content.title.toUpperCase(), margin, 28);

  y = 45;
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text(`Version ${content.version} | Last Updated: ${content.lastUpdated}`, margin, y);
  y += 12;

  content.sections.forEach((section) => {
    if (y > 265) { doc.addPage(); y = 20; }
    doc.setFillColor(0, 61, 122);
    doc.rect(margin, y - 4, maxWidth, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(section.heading, margin + 2, y + 1);
    y += 10;

    if (section.content) {
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(section.content, maxWidth);
      lines.forEach((line) => {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.text(line, margin, y);
        y += 4;
      });
      y += 4;
    }

    if (section.subsections) {
      section.subsections.forEach((sub) => {
        if (y > 265) { doc.addPage(); y = 20; }
        doc.setTextColor(0, 128, 200);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(sub.subheading, margin, y);
        y += 6;
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(sub.content, maxWidth);
        lines.forEach((line) => {
          if (y > 275) { doc.addPage(); y = 20; }
          doc.text(line, margin, y);
          y += 4;
        });
        y += 4;
      });
    }
  });

  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(`iWhistle, LLC | ${content.title} | Version ${content.version}`, margin, 285);
  doc.save(`iWhistle-${content.title.replace(/\s+/g, '-')}.pdf`);
}

export function Documents() {
  const [viewingDoc, setViewingDoc] = useState(null);

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
            Review and download all the legal agreements and documentation needed to establish
            a partnership with iWhistle.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
          {documents.map((doc) => (
            <StaggerItem key={doc.title}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className="group h-full bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-iwhistle-light/50 transition-all duration-300 flex flex-col"
                data-testid={`doc-card-${doc.slug}`}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${doc.color} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300`}>
                  <doc.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{doc.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-6 flex-1">{doc.description}</p>
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => setViewingDoc(doc.slug)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                    data-testid={`view-${doc.slug}`}
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </motion.button>
                  <motion.button
                    onClick={() => generateDocPdf(documentContent[doc.slug])}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                    data-testid={`download-${doc.slug}`}
                  >
                    <Download className="w-4 h-4" />
                  </motion.button>
                </div>
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

      <AnimatePresence>
        {viewingDoc && documentContent[viewingDoc] && (
          <DocumentViewer
            document={document}
            content={documentContent[viewingDoc]}
            onClose={() => setViewingDoc(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
