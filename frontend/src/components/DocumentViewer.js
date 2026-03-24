import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ChevronUp, Printer, BookOpen } from 'lucide-react';
import { jsPDF } from 'jspdf';

export function DocumentViewer({ document: documentSlug, content, onClose }) {
  const [activeSection, setActiveSection] = useState(null);
  const contentRef = useRef(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    window.document.body.style.overflow = 'hidden';
    return () => { window.document.body.style.overflow = ''; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (e) => {
    setShowBackToTop(e.target.scrollTop > 300);

    const sections = e.target.querySelectorAll('[data-section-id]');
    let current = null;
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top < 200) current = section.getAttribute('data-section-id');
    });
    if (current !== activeSection) setActiveSection(current);
  };

  const scrollToSection = (idx) => {
    const el = contentRef.current?.querySelector(`[data-section-id="${idx}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToTop = () => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let y = 20;

    // Header
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

    // Footer on last page
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`iWhistle, LLC | ${content.title} | Version ${content.version}`, margin, 285);

    doc.save(`iWhistle-${content.title.replace(/\s+/g, '-')}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex"
      data-testid="document-viewer-overlay"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Viewer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative ml-auto w-full max-w-4xl bg-white shadow-2xl flex flex-col"
        data-testid="document-viewer-panel"
      >
        {/* Sticky Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-iwhistle-deep to-iwhistle-blue text-white">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5" />
              <div>
                <h2 className="text-lg font-bold" data-testid="viewer-title">{content.title}</h2>
                <p className="text-white/70 text-xs">Version {content.version} &middot; Updated {content.lastUpdated}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                data-testid="viewer-print-btn"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                title="Print"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownloadPdf}
                data-testid="viewer-download-btn"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={onClose}
                data-testid="viewer-close-btn"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Table of Contents (scrollable horizontally on mobile) */}
          <div className="px-6 pb-3 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {content.sections.map((section, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToSection(idx)}
                  data-testid={`toc-item-${idx}`}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    activeSection === String(idx)
                      ? 'bg-white text-iwhistle-deep'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {section.heading.replace(/^\d+\.\s*/, '').substring(0, 25)}{section.heading.replace(/^\d+\.\s*/, '').length > 25 ? '...' : ''}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Document Content */}
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-8 py-8 print:px-4"
          data-testid="viewer-content"
        >
          {/* Document title block */}
          <div className="mb-10 pb-8 border-b-2 border-iwhistle-blue/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">i</span>
              </div>
              <span className="font-bold text-xl text-iwhistle-deep">Whistle</span>
            </div>
            <h1 className="text-3xl font-bold text-iwhistle-deep mb-2">{content.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Version {content.version}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>Last Updated: {content.lastUpdated}</span>
            </div>
          </div>

          {/* Sections */}
          {content.sections.map((section, idx) => (
            <div
              key={idx}
              data-section-id={idx}
              className="mb-10 scroll-mt-4"
            >
              <h2 className="text-xl font-bold text-iwhistle-deep mb-4 pb-2 border-b border-gray-200">
                {section.heading}
              </h2>

              {section.content && (
                <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                  {section.content}
                </div>
              )}

              {section.subsections && section.subsections.map((sub, subIdx) => (
                <div key={subIdx} className="mt-6 ml-4 pl-4 border-l-2 border-iwhistle-light/30">
                  <h3 className="text-base font-semibold text-iwhistle-blue mb-3">
                    {sub.subheading}
                  </h3>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                    {sub.content}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Footer */}
          <div className="mt-12 pt-8 border-t-2 border-gray-100 text-center">
            <p className="text-gray-400 text-xs">
              &copy; 2026 iWhistle, LLC. All rights reserved.
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {content.title} &middot; Version {content.version}
            </p>
          </div>
        </div>

        {/* Back to top */}
        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={scrollToTop}
              data-testid="back-to-top-btn"
              className="absolute bottom-6 right-6 p-3 bg-iwhistle-blue text-white rounded-full shadow-lg hover:bg-iwhistle-deep transition-colors"
            >
              <ChevronUp className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
