import { jsPDF } from 'jspdf';

/**
 * Generates a professionally styled signed agreement certificate PDF.
 * Includes drawn signature image, all partnership details, and legal compliance metadata.
 */
export function generateSignedPDF(app) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const maxWidth = pageWidth - margin * 2;

  // ─── Certificate ID ────────────────────────────────────────────────────────
  const rawId = app.id || app._id || '';
  const certId = `CERT-${rawId.substring(0, 8).toUpperCase() || Date.now().toString(36).toUpperCase()}`;

  // ─── Helper: section header bar ───────────────────────────────────────────
  const sectionHeader = (title, y, color = [0, 128, 200]) => {
    doc.setFillColor(...color);
    doc.rect(margin, y - 3, maxWidth, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 3, y + 2);
    return y + 11;
  };

  // ─── Helper: key-value row ────────────────────────────────────────────────
  const row = (label, value, y, labelW = 48) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(90, 90, 90);
    doc.text(`${label}:`, margin + 3, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    const lines = doc.splitTextToSize(value || '—', maxWidth - labelW - 3);
    doc.text(lines, margin + labelW, y);
    return y + lines.length * 5 + 1;
  };

  // ─── Cover / Page-break guard ─────────────────────────────────────────────
  const checkPage = (y, needed = 20) => {
    if (y + needed > 272) { doc.addPage(); return 20; }
    return y;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 1 — HEADER
  // ═══════════════════════════════════════════════════════════════════════════

  // Deep-blue header band
  doc.setFillColor(0, 61, 122);
  doc.rect(0, 0, pageWidth, 44, 'F');

  // Accent stripe
  doc.setFillColor(255, 140, 0);
  doc.rect(0, 44, pageWidth, 3, 'F');

  // Logo text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text('i', margin, 22);
  doc.setFontSize(22);
  doc.text('Whistle', margin + 8, 22);

  // Sub-tagline
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255, 0.7);
  doc.text('Leadership Under Pressure', margin, 30);

  // Certificate title (right-aligned)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('SIGNED PARTNERSHIP AGREEMENT', pageWidth - margin, 19, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(200, 220, 255);
  doc.text('CERTIFICATE', pageWidth - margin, 26, { align: 'right' });

  // Certificate ID box
  doc.setFillColor(0, 40, 90);
  doc.roundedRect(pageWidth - margin - 52, 32, 52, 9, 1, 1, 'F');
  doc.setFontSize(7);
  doc.setTextColor(180, 210, 255);
  doc.text(certId, pageWidth - margin - 26, 38, { align: 'center' });

  let y = 54;

  // ─── Status banner ────────────────────────────────────────────────────────
  const statusColors = {
    approved: [22, 163, 74],
    rejected: [220, 38, 38],
    pending: [217, 119, 6],
  };
  const statusLabel = { approved: 'APPROVED', rejected: 'REJECTED', pending: 'PENDING REVIEW' };
  const [sr, sg, sb] = statusColors[app.status] || statusColors.pending;
  doc.setFillColor(sr, sg, sb);
  doc.roundedRect(margin, y, 50, 8, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(statusLabel[app.status] || 'PENDING', margin + 4, y + 5.5);

  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Submitted: ${app.created_at ? new Date(app.created_at).toLocaleDateString() : '—'}`, margin + 56, y + 5.5);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, y + 5.5, { align: 'right' });

  y += 14;

  // ─── Organization ─────────────────────────────────────────────────────────
  y = sectionHeader('PARTNER ORGANIZATION', y, [0, 61, 122]);
  y = row('Organization', app.partnerOrgName, y);
  y = row('Entity Type', app.partnerEntityType, y);
  y = row('State', app.partnerState, y);
  const addr = [app.partnerAddress, app.partnerCity, app.partnerState, app.partnerZip].filter(Boolean).join(', ');
  y = row('Address', addr, y);
  y += 4;

  // ─── Primary Contact ──────────────────────────────────────────────────────
  y = checkPage(y, 30);
  y = sectionHeader('PRIMARY CONTACT', y, [0, 100, 180]);
  y = row('Name', app.contactName, y);
  y = row('Title', app.contactTitle, y);
  y = row('Email', app.contactEmail, y);
  y = row('Phone', app.contactPhone, y);
  y += 4;

  // ─── Program & Pricing ────────────────────────────────────────────────────
  y = checkPage(y, 40);
  y = sectionHeader('PROGRAM & PRICING', y, [0, 100, 180]);
  const term = app.termStructure === 'annual' ? 'Annual (12 months)' : 'Seasonal (3–6 months)';
  const rate = parseFloat(app.perUserRate) || 0;
  const officials = parseInt(app.numOfficials) || 0;
  const months = app.termStructure === 'annual' ? 12 : 4;
  const discount = parseFloat(app.pilotDiscount) || 0;
  const total = (rate * officials * months * (1 - discount / 100)).toFixed(2);
  y = row('Organization Type', app.orgType, y);
  y = row('Term Structure', term, y);
  y = row('Period', `${app.startDate || '—'} to ${app.endDate || '—'}`, y);
  y = row('Authorized Users', `${app.numOfficials || '—'} officials`, y);
  y = row('Per-User Monthly Rate', `$${app.perUserRate || '—'}`, y);
  y = row('Pilot Discount', `${app.pilotDiscount || '0'}%`, y);
  y = row('TOTAL AGREEMENT VALUE', `$${total}`, y);
  y += 4;

  // ─── Champion ─────────────────────────────────────────────────────────────
  if (app.championName) {
    y = checkPage(y, 25);
    y = sectionHeader('PARTNER CHAMPION', y, [0, 100, 180]);
    y = row('Name', app.championName, y);
    y = row('Title', app.championTitle, y);
    y = row('Email', app.championEmail, y);
    y += 4;
  }

  // ─── Authorized Signatory ─────────────────────────────────────────────────
  y = checkPage(y, 30);
  y = sectionHeader('AUTHORIZED SIGNATORY', y, [0, 61, 122]);
  y = row('Full Name', app.signerName, y);
  y = row('Title', app.signerTitle, y);
  y = row('Signature Date', app.signatureDate, y);
  y += 6;

  // ─── Signature Image ──────────────────────────────────────────────────────
  if (app.signature) {
    y = checkPage(y, 55);
    y = sectionHeader('DIGITAL SIGNATURE', y, [0, 61, 122]);

    // Signature box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(180, 200, 220);
    doc.roundedRect(margin, y, maxWidth, 38, 2, 2, 'FD');

    try {
      doc.addImage(app.signature, 'PNG', margin + 8, y + 3, 90, 30);
    } catch {
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(9);
      doc.text('[Signature image on file]', margin + 10, y + 20);
    }

    // Signer name under signature
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.text(app.signerName || '', margin + 10, y + 36);

    // Dashed baseline
    doc.setLineDash([1.5, 1]);
    doc.setDrawColor(120, 140, 160);
    doc.line(margin + 8, y + 34, margin + 100, y + 34);
    doc.setLineDash([]);

    y += 44;
  }

  // ─── Legal Compliance Metadata ────────────────────────────────────────────
  if (app.signature_metadata) {
    y = checkPage(y, 45);
    y = sectionHeader('LEGAL COMPLIANCE RECORD', y, [0, 61, 122]);

    doc.setFillColor(235, 245, 255);
    doc.setDrawColor(0, 100, 200);
    doc.roundedRect(margin, y, maxWidth, 34, 2, 2, 'FD');

    const meta = app.signature_metadata;
    const signedAt = meta.signed_at ? new Date(meta.signed_at).toLocaleString() : '—';
    const ua = (meta.user_agent || '—').substring(0, 72);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(0, 61, 122);
    doc.text('Signed At:', margin + 4, y + 8);
    doc.text('IP Address:', margin + 4, y + 16);
    doc.text('Device / Browser:', margin + 4, y + 24);
    doc.text('Certificate ID:', margin + 4, y + 32);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.text(signedAt, margin + 40, y + 8);
    doc.text(meta.ip_address || '—', margin + 40, y + 16);
    doc.text(ua, margin + 40, y + 24);
    doc.text(certId, margin + 40, y + 32);

    y += 40;
  }

  // ─── Footer ───────────────────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let pg = 1; pg <= totalPages; pg++) {
    doc.setPage(pg);
    const footerY = 282;

    doc.setFillColor(0, 61, 122);
    doc.rect(0, footerY - 1, pageWidth, 0.5, 'F');

    doc.setFillColor(0, 61, 122);
    doc.rect(0, footerY, pageWidth, 15, 'F');

    doc.setTextColor(180, 210, 255);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'italic');
    doc.text(
      'This certificate serves as a legally binding digital record of the partnership agreement between the listed organization and iWhistle, LLC.',
      margin, footerY + 5, { maxWidth: maxWidth - 20 }
    );
    doc.setFont('helvetica', 'normal');
    doc.text(
      `${certId}  |  iWhistle B2B Partnership Portal  |  Page ${pg} of ${totalPages}`,
      pageWidth / 2, footerY + 11, { align: 'center' }
    );
  }

  // ─── Save ─────────────────────────────────────────────────────────────────
  const filename = `iWhistle-Certificate-${(app.partnerOrgName || 'Partner').replace(/\s+/g, '-')}-${certId}.pdf`;
  doc.save(filename);
}
