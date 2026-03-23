import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Download, FileText, Shield, Scale, Lock } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { DocumentViewer } from '../DocumentViewer';
import { documentContent } from '../../data/documentContent';

const docMeta = [
  { icon: FileText, title: 'Pilot Program Agreement', slug: 'pilot-program-agreement', color: 'from-iwhistle-blue to-iwhistle-light' },
  { icon: Shield, title: 'Data Processing Agreement', slug: 'data-processing-agreements', color: 'from-iwhistle-light to-iwhistle-orange' },
  { icon: Scale, title: 'Terms of Service', slug: 'terms-of-service', color: 'from-iwhistle-orange to-iwhistle-burnt' },
  { icon: Lock, title: 'Privacy Policy', slug: 'privacy-policy', color: 'from-iwhistle-deep to-iwhistle-blue' },
];

function generateDocPdf(content: any) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;
  doc.setFillColor(0, 61, 122);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16); doc.setFont('helvetica', 'bold');
  doc.text('iWhistle', margin, 18);
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.text(content.title.toUpperCase(), margin, 28);
  y = 45;
  doc.setTextColor(100, 100, 100); doc.setFontSize(8);
  doc.text(`Version ${content.version} | Last Updated: ${content.lastUpdated}`, margin, y);
  y += 12;
  content.sections.forEach((section: any) => {
    if (y > 265) { doc.addPage(); y = 20; }
    doc.setFillColor(0, 61, 122); doc.rect(margin, y - 4, maxWidth, 7, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text(section.heading, margin + 2, y + 1); y += 10;
    if (section.content) {
      doc.setTextColor(50, 50, 50); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(section.content, maxWidth);
      lines.forEach((line: string) => { if (y > 275) { doc.addPage(); y = 20; } doc.text(line, margin, y); y += 4; }); y += 4;
    }
    if (section.subsections) {
      section.subsections.forEach((sub: any) => {
        if (y > 265) { doc.addPage(); y = 20; }
        doc.setTextColor(0, 128, 200); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
        doc.text(sub.subheading, margin, y); y += 6;
        doc.setTextColor(50, 50, 50); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(sub.content, maxWidth);
        lines.forEach((line: string) => { if (y > 275) { doc.addPage(); y = 20; } doc.text(line, margin, y); y += 4; }); y += 4;
      });
    }
  });
  doc.save(`iWhistle-${content.title.replace(/\s+/g, '-')}.pdf`);
}

export function DocumentsTab() {
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);

  return (
    <div className="p-6 lg:p-8" data-testid="documents-tab">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-iwhistle-deep">Partnership Documents</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Review and download all partnership agreements and legal documentation
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-5">
        {docMeta.map((doc, i) => (
          <motion.div key={doc.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow"
            data-testid={`partner-doc-card-${doc.slug}`}>
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${doc.color} flex items-center justify-center mb-4`}>
              <doc.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-iwhistle-deep text-sm mb-2 flex-1">{doc.title}</h3>
            <p className="text-xs text-gray-400 mb-4">
              v{(documentContent as any)[doc.slug]?.version} &middot; Updated {(documentContent as any)[doc.slug]?.lastUpdated}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setViewingDoc(doc.slug)}
                data-testid={`partner-view-${doc.slug}`}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-iwhistle-blue bg-iwhistle-blue/10 hover:bg-iwhistle-blue/20 rounded-lg transition-colors">
                <Eye className="w-3.5 h-3.5" /> View
              </button>
              <button onClick={() => generateDocPdf((documentContent as any)[doc.slug])}
                data-testid={`partner-download-${doc.slug}`}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {viewingDoc && (documentContent as any)[viewingDoc] && (
          <DocumentViewer
            document={document}
            content={(documentContent as any)[viewingDoc]}
            onClose={() => setViewingDoc(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
