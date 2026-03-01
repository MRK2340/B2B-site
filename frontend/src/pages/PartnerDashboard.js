import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';import {
  LayoutDashboard, FileCheck2, BookOpen, PenLine, LogOut,
  ChevronRight, Clock, CheckCircle, XCircle, Eye, Download,
  RefreshCw, Users, Building2, X, Menu, Loader2, FileText,
  Shield, Scale, Lock, MapPin, Monitor
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PartnershipForm } from '../sections/PartnershipForm';
import { DocumentViewer } from '../components/DocumentViewer';
import { documentContent } from '../data/documentContent';
import { jsPDF } from 'jspdf';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'applications', label: 'My Applications', icon: FileCheck2 },
  { id: 'documents', label: 'Documents', icon: BookOpen },
  { id: 'apply', label: 'Apply Now', icon: PenLine },
];

const statusConfig = {
  pending: { label: 'Pending Review', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
};

const docMeta = [
  { icon: FileText, title: 'Pilot Program Agreement', slug: 'pilot-program-agreement', color: 'from-iwhistle-blue to-iwhistle-light' },
  { icon: Shield, title: 'Data Processing Agreement', slug: 'data-processing-agreements', color: 'from-iwhistle-light to-iwhistle-orange' },
  { icon: Scale, title: 'Terms of Service', slug: 'terms-of-service', color: 'from-iwhistle-orange to-iwhistle-burnt' },
  { icon: Lock, title: 'Privacy Policy', slug: 'privacy-policy', color: 'from-iwhistle-deep to-iwhistle-blue' },
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
  doc.setFontSize(16); doc.setFont('helvetica', 'bold');
  doc.text('iWhistle', margin, 18);
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.text(content.title.toUpperCase(), margin, 28);
  y = 45;
  doc.setTextColor(100, 100, 100); doc.setFontSize(8);
  doc.text(`Version ${content.version} | Last Updated: ${content.lastUpdated}`, margin, y);
  y += 12;
  content.sections.forEach((section) => {
    if (y > 265) { doc.addPage(); y = 20; }
    doc.setFillColor(0, 61, 122); doc.rect(margin, y - 4, maxWidth, 7, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text(section.heading, margin + 2, y + 1); y += 10;
    if (section.content) {
      doc.setTextColor(50, 50, 50); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(section.content, maxWidth);
      lines.forEach((line) => { if (y > 275) { doc.addPage(); y = 20; } doc.text(line, margin, y); y += 4; }); y += 4;
    }
    if (section.subsections) {
      section.subsections.forEach((sub) => {
        if (y > 265) { doc.addPage(); y = 20; }
        doc.setTextColor(0, 128, 200); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
        doc.text(sub.subheading, margin, y); y += 6;
        doc.setTextColor(50, 50, 50); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(sub.content, maxWidth);
        lines.forEach((line) => { if (y > 275) { doc.addPage(); y = 20; } doc.text(line, margin, y); y += 4; }); y += 4;
      });
    }
  });
  doc.save(`iWhistle-${content.title.replace(/\s+/g, '-')}.pdf`);
}

// ─── Application Detail Modal ─────────────────────────────────────────────────
function AppDetailModal({ app, onClose }) {
  if (!app) return null;
  const cfg = statusConfig[app.status] || statusConfig.pending;
  const StatusIcon = cfg.icon;
  const total = (() => {
    const rate = parseFloat(app.perUserRate) || 0;
    const officials = parseInt(app.numOfficials) || 0;
    const months = app.termStructure === 'annual' ? 12 : 4;
    const discount = parseFloat(app.pilotDiscount) || 0;
    return (rate * officials * months * (1 - discount / 100)).toFixed(2);
  })();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose} data-testid="app-detail-overlay">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto"
        data-testid="app-detail-modal">
        <div className="bg-gradient-to-r from-iwhistle-deep to-iwhistle-blue p-6 rounded-t-2xl flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{app.partnerOrgName}</h2>
            <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {cfg.label}
            </div>
          </div>
          <button onClick={onClose} data-testid="close-app-detail-btn" className="text-white/70 hover:text-white mt-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {[
              ['Organization', app.partnerOrgName],
              ['Type', app.orgType],
              ['Contact', app.contactName],
              ['Email', app.contactEmail],
              ['Term', app.termStructure === 'annual' ? 'Annual' : 'Seasonal'],
              ['Officials', app.numOfficials],
              ['Monthly Rate', `$${app.perUserRate || '-'}`],
              ['Total Value', `$${total}`],
              ['Submitted', app.created_at ? new Date(app.created_at).toLocaleDateString() : '-'],
              ['Status', cfg.label],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="text-sm font-medium text-gray-900">{value || '-'}</p>
              </div>
            ))}
          </div>
          {app.signature && (
            <div>
              <p className="text-xs text-gray-400 mb-2">Digital Signature</p>
              <img src={app.signature} alt="Signature" className="border border-gray-200 rounded-lg p-2 max-h-20 bg-gray-50" />
            </div>
          )}

          {/* Signature Metadata */}
          {app.signature_metadata && (
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50" data-testid="partner-sig-metadata">
              <p className="text-xs font-semibold text-iwhistle-blue mb-3 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" /> Legal Compliance Record
              </p>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Signed at</p>
                    <p className="text-xs font-semibold text-gray-800" data-testid="partner-sig-timestamp">
                      {app.signature_metadata.signed_at
                        ? new Date(app.signature_metadata.signed_at).toLocaleString()
                        : '-'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">IP Address</p>
                    <p className="text-xs font-semibold text-gray-800 font-mono" data-testid="partner-sig-ip">
                      {app.signature_metadata.ip_address || '-'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Monitor className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Device</p>
                    <p className="text-xs text-gray-700 truncate" data-testid="partner-sig-useragent"
                       title={app.signature_metadata.user_agent}>
                      {app.signature_metadata.user_agent
                        ? app.signature_metadata.user_agent.split(' ').slice(0, 3).join(' ') + '...'
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ user, stats, applications, setActiveTab }) {
  const latestApp = applications[0];
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-6 lg:p-8 space-y-8" data-testid="overview-tab">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-iwhistle-deep to-iwhistle-blue rounded-2xl p-7 text-white">
        <p className="text-white/70 text-sm mb-1">{greeting()},</p>
        <h1 className="text-2xl font-bold mb-1">{user?.name}</h1>
        <p className="text-white/80 text-sm flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          {user?.organization}
        </p>
        {latestApp && (
          <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig[latestApp.status]?.color || statusConfig.pending.color}`}>
            Latest application: <span className="font-semibold">{latestApp.partnerOrgName}</span>
            &mdash; {statusConfig[latestApp.status]?.label}
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-4">Application Summary</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Submitted', value: stats.total, color: 'bg-iwhistle-blue', icon: Users },
            { label: 'Pending Review', value: stats.pending, color: 'bg-amber-500', icon: Clock },
            { label: 'Approved', value: stats.approved, color: 'bg-green-500', icon: CheckCircle },
            { label: 'Rejected', value: stats.rejected, color: 'bg-red-500', icon: XCircle },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
              data-testid={`overview-stat-${s.label.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-iwhistle-deep">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: PenLine, label: 'Start New Application', desc: 'Submit a partnership application', tab: 'apply', bg: 'gradient-primary', text: 'text-white' },
            { icon: BookOpen, label: 'Review Documents', desc: 'Access all partnership documents', tab: 'documents', bg: 'bg-white border border-gray-200', text: 'text-iwhistle-deep' },
            { icon: FileCheck2, label: 'Track Applications', desc: 'View status of your submissions', tab: 'applications', bg: 'bg-white border border-gray-200', text: 'text-iwhistle-deep' },
          ].map((action) => (
            <motion.button key={action.label} onClick={() => setActiveTab(action.tab)}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              data-testid={`quick-action-${action.tab}`}
              className={`${action.bg} ${action.text} rounded-xl p-5 text-left flex items-start gap-4 transition-shadow hover:shadow-md`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${action.bg.includes('gradient') ? 'bg-white/20' : 'bg-iwhistle-blue/10'}`}>
                <action.icon className={`w-5 h-5 ${action.bg.includes('gradient') ? 'text-white' : 'text-iwhistle-blue'}`} />
              </div>
              <div>
                <p className="font-semibold text-sm">{action.label}</p>
                <p className={`text-xs mt-0.5 ${action.bg.includes('gradient') ? 'text-white/70' : 'text-gray-500'}`}>{action.desc}</p>
              </div>
              <ChevronRight className={`w-4 h-4 ml-auto mt-0.5 ${action.bg.includes('gradient') ? 'text-white/60' : 'text-gray-400'}`} />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Applications Tab ─────────────────────────────────────────────────────────
function ApplicationsTab({ applications, loading, onRefresh, setActiveTab }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="p-6 lg:p-8" data-testid="applications-tab">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-iwhistle-deep">My Applications</h2>
          <p className="text-sm text-gray-500 mt-0.5">{applications.length} application{applications.length !== 1 ? 's' : ''} submitted</p>
        </div>
        <button onClick={onRefresh} disabled={loading} data-testid="refresh-apps-btn"
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-iwhistle-blue animate-spin" /></div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <FileCheck2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No applications yet</h3>
          <p className="text-gray-400 text-sm mb-6">Submit your first partnership application to get started</p>
          <button onClick={() => setActiveTab('apply')} data-testid="start-first-app-btn"
            className="inline-flex items-center gap-2 px-6 py-2.5 gradient-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
            <PenLine className="w-4 h-4" />
            Start Application
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="applications-table">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Term</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {applications.map((app, idx) => {
                  const cfg = statusConfig[app.status] || statusConfig.pending;
                  const StatusIcon = cfg.icon;
                  return (
                    <motion.tr key={app.id || idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}
                      className="hover:bg-gray-50/50 transition-colors" data-testid={`app-row-${idx}`}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-sm text-iwhistle-deep">{app.partnerOrgName}</div>
                        <div className="text-xs text-gray-400">{app.orgType}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {app.created_at ? new Date(app.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 capitalize">{app.termStructure || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setSelected(app)} data-testid={`view-app-btn-${idx}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-iwhistle-blue hover:text-iwhistle-deep hover:bg-iwhistle-blue/10 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selected && <AppDetailModal app={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Documents Tab ────────────────────────────────────────────────────────────
function DocumentsTab() {
  const [viewingDoc, setViewingDoc] = useState(null);

  return (
    <div className="p-6 lg:p-8" data-testid="documents-tab">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-iwhistle-deep">Partnership Documents</h2>
        <p className="text-sm text-gray-500 mt-0.5">Review and download all partnership agreements and legal documentation</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-5">
        {docMeta.map((doc, i) => (
          <motion.div key={doc.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow"
            data-testid={`partner-doc-card-${doc.slug}`}>
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${doc.color} flex items-center justify-center mb-4`}>
              <doc.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-iwhistle-deep text-sm mb-2 flex-1">{doc.title}</h3>
            <p className="text-xs text-gray-400 mb-4">
              v{documentContent[doc.slug]?.version} &middot; Updated {documentContent[doc.slug]?.lastUpdated}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setViewingDoc(doc.slug)}
                data-testid={`partner-view-${doc.slug}`}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-iwhistle-blue bg-iwhistle-blue/10 hover:bg-iwhistle-blue/20 rounded-lg transition-colors">
                <Eye className="w-3.5 h-3.5" /> View
              </button>
              <button onClick={() => generateDocPdf(documentContent[doc.slug])}
                data-testid={`partner-download-${doc.slug}`}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
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
    </div>
  );
}

// ─── Main Partner Dashboard ───────────────────────────────────────────────────
export default function PartnerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, token, logout } = useAuth();

  const fetchApplications = useCallback(async () => {
    if (!token) return;
    setLoadingApps(true);
    try {
      const res = await fetch(`${API_URL}/api/partnerships`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setApplications(data.partnerships || []);
    } catch (e) {
      console.error('Failed to fetch applications:', e);
    } finally {
      setLoadingApps(false);
    }
  }, [token]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  // Refresh when switching to applications tab
  useEffect(() => {
    if (activeTab === 'applications') fetchApplications();
  }, [activeTab, fetchApplications]);

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-base">i</span>
          </div>
          <span className="font-bold text-xl text-white">Whistle</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveTab(item.id); setMobileSidebarOpen(false); }}
            data-testid={`sidebar-nav-${item.id}`}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === item.id
                ? 'bg-white text-iwhistle-deep shadow-sm'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {item.label}
            {item.id === 'applications' && stats.pending > 0 && (
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                activeTab === item.id ? 'bg-amber-100 text-amber-700' : 'bg-amber-400/30 text-amber-200'
              }`}>
                {stats.pending}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* User profile + logout */}
      <div className="px-4 py-6 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 mb-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">{user?.name?.[0]?.toUpperCase()}</span>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-white/60 truncate">{user?.organization}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          data-testid="partner-logout-btn"
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50" data-testid="partner-dashboard">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-iwhistle-deep fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden" />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 bg-iwhistle-deep z-50 lg:hidden flex flex-col">
              <button onClick={() => setMobileSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden bg-iwhistle-deep text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebarOpen(true)} data-testid="mobile-menu-btn"
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-lg">iWhistle</span>
          </div>
          <span className="text-sm text-white/70">{navItems.find(n => n.id === activeTab)?.label}</span>
        </header>

        {/* Page header */}
        <div className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
          <div>
            <h1 className="text-lg font-bold text-iwhistle-deep">{navItems.find(n => n.id === activeTab)?.label}</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="font-medium text-iwhistle-deep">{user?.name}</span>
            <span className="text-gray-300">|</span>
            <span>{user?.organization}</span>
          </div>
        </div>

        {/* Tab content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {activeTab === 'overview' && (
                <OverviewTab user={user} stats={stats} applications={applications} setActiveTab={setActiveTab} />
              )}
              {activeTab === 'applications' && (
                <ApplicationsTab applications={applications} loading={loadingApps} onRefresh={fetchApplications} setActiveTab={setActiveTab} />
              )}
              {activeTab === 'documents' && <DocumentsTab />}
              {activeTab === 'apply' && (
                <div data-testid="apply-tab">
                  <PartnershipForm onSubmitSuccess={fetchApplications} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 flex">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              data-testid={`mobile-nav-${item.id}`}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 text-xs font-medium transition-colors relative ${
                activeTab === item.id ? 'text-iwhistle-blue' : 'text-gray-400'
              }`}>
              <item.icon className="w-5 h-5 mb-0.5" />
              {item.label === 'My Applications' ? 'Applications' : item.label}
              {item.id === 'applications' && stats.pending > 0 && (
                <span className="absolute top-1.5 right-1/4 w-2 h-2 bg-amber-400 rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
