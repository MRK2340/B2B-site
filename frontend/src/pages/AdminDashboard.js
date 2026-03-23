import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Users, DollarSign, Clock, CheckCircle, XCircle,
  Trash2, Eye, RefreshCw, Search, Filter, ChevronDown, Download,
  LogOut, Shield, Monitor, MapPin, Bell, MessageSquare, Moon, Sun
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { generateSignedPDF } from '../utils/generateSignedPDF';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
};

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-card p-6"
      data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-iwhistle-deep dark:text-white">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

function PartnershipDetailModal({ partnership, onClose, onStatusChange }) {
  if (!partnership) return null;

  const total = (() => {
    const rate = parseFloat(partnership.perUserRate) || 0;
    const officials = parseInt(partnership.numOfficials) || 0;
    const months = partnership.termStructure === 'annual' ? 12 : 4;
    const discount = parseFloat(partnership.pilotDiscount) || 0;
    return (rate * officials * months * (1 - discount / 100)).toFixed(2);
  })();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        data-testid="partnership-detail-modal"
      >
        <div className="bg-gradient-to-r from-iwhistle-deep to-iwhistle-blue p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{partnership.partnerOrgName}</h2>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl" data-testid="close-modal-btn">&times;</button>
          </div>
          <p className="text-white/70 text-sm mt-1">Submitted {new Date(partnership.created_at).toLocaleDateString()}</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex gap-2">
            {['pending', 'approved', 'rejected'].map((s) => {
              const cfg = statusConfig[s];
              return (
                <button
                  key={s}
                  onClick={() => onStatusChange(partnership.id, s)}
                  data-testid={`status-btn-${s}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    partnership.status === s ? cfg.color + ' ring-2 ring-offset-1' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DetailSection title="Organization" items={[
              ['Name', partnership.partnerOrgName],
              ['Type', partnership.orgType],
              ['Entity', partnership.partnerEntityType],
              ['Address', `${partnership.partnerAddress}, ${partnership.partnerCity}, ${partnership.partnerState} ${partnership.partnerZip}`],
            ]} />
            <DetailSection title="Primary Contact" items={[
              ['Name', partnership.contactName],
              ['Title', partnership.contactTitle],
              ['Email', partnership.contactEmail],
              ['Phone', partnership.contactPhone],
            ]} />
            <DetailSection title="Champion" items={[
              ['Name', partnership.championName],
              ['Title', partnership.championTitle],
              ['Email', partnership.championEmail],
              ['Phone', partnership.championPhone],
            ]} />
            <DetailSection title="Program & Pricing" items={[
              ['Term', partnership.termStructure === 'annual' ? 'Annual' : 'Seasonal'],
              ['Period', `${partnership.startDate || '-'} to ${partnership.endDate || '-'}`],
              ['Officials', partnership.numOfficials],
              ['Rate', `$${partnership.perUserRate}/mo`],
              ['Discount', `${partnership.pilotDiscount || 0}%`],
              ['Total', `$${total}`],
            ]} />
          </div>

          <div>
            <DetailSection title="Signatory" items={[
              ['Name', partnership.signerName],
              ['Title', partnership.signerTitle],
              ['Date', partnership.signatureDate],
            ]} />
          </div>

          {(partnership.signature || partnership.signature_metadata) && (
            <div className="border border-gray-100 rounded-xl p-5 bg-gray-50/50" data-testid="signature-compliance-section">
              <h4 className="text-sm font-semibold text-iwhistle-blue mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Digital Signature &amp; Compliance Record
              </h4>
              {partnership.signature && (
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Drawn Signature</p>
                  <img
                    src={partnership.signature}
                    alt="Partner Signature"
                    data-testid="admin-signature-img"
                    className="border border-gray-200 rounded-lg p-3 bg-white max-h-24 max-w-full"
                  />
                </div>
              )}
              {partnership.signature_metadata && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-3.5 h-3.5 text-iwhistle-blue" />
                      <p className="text-xs font-medium text-gray-500">Signed At</p>
                    </div>
                    <p className="text-xs text-gray-800 font-semibold" data-testid="admin-sig-timestamp">
                      {partnership.signature_metadata.signed_at
                        ? new Date(partnership.signature_metadata.signed_at).toLocaleString()
                        : '-'}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-iwhistle-blue" />
                      <p className="text-xs font-medium text-gray-500">IP Address</p>
                    </div>
                    <p className="text-xs text-gray-800 font-semibold font-mono" data-testid="admin-sig-ip">
                      {partnership.signature_metadata.ip_address || '-'}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Monitor className="w-3.5 h-3.5 text-iwhistle-blue" />
                      <p className="text-xs font-medium text-gray-500">Device / Browser</p>
                    </div>
                    <p className="text-xs text-gray-700 truncate" data-testid="admin-sig-useragent" title={partnership.signature_metadata.user_agent}>
                      {partnership.signature_metadata.user_agent
                        ? partnership.signature_metadata.user_agent.split(' ').slice(0, 3).join(' ') + '...'
                        : '-'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {(partnership.signature || partnership.signature_metadata) && (
            <div className="border-t border-gray-100 pt-4">
              <button
                onClick={() => generateSignedPDF(partnership)}
                data-testid="download-signed-pdf-btn"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 gradient-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                <Download className="w-5 h-5" />
                Download Signed Certificate PDF
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function DetailSection({ title, items }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-iwhistle-blue mb-2">{title}</h4>
      <div className="space-y-1">
        {items.map(([label, value]) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-gray-500">{label}</span>
            <span className="text-gray-900 font-medium text-right">{value || '-'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [partnerships, setPartnerships] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, total_value: 0, total_officials: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedPartnership, setSelectedPartnership] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [inquiries, setInquiries] = useState([]);
  const [showInquiries, setShowInquiries] = useState(false);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const { token, logout } = useAuth();
  const { isDark, toggle: toggleTheme } = useTheme();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [pRes, sRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/partnerships`, { headers }),
        fetch(`${API_URL}/api/admin/stats`, { headers }),
      ]);
      const pData = await pRes.json();
      const sData = await sRes.json();
      setPartnerships(pData.partnerships || []);
      setStats(sData);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchInquiries = useCallback(async () => {
    setInquiriesLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/contact`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setInquiries(data.inquiries || []);
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
    } finally {
      setInquiriesLoading(false);
    }
  }, [token]);

  const markInquiryRead = async (id) => {
    try {
      await fetch(`${API_URL}/api/admin/contact/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setInquiries((prev) => prev.map((i) => i.id === id ? { ...i, status: 'read' } : i));
    } catch (err) {
      console.error('Failed to mark inquiry read:', err);
    }
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  // Notification badge — count new partnerships since last admin visit
  useEffect(() => {
    if (partnerships.length > 0) {
      const lastSeen = localStorage.getItem('admin_last_seen');
      if (lastSeen) {
        const count = partnerships.filter((p) => new Date(p.created_at) > new Date(lastSeen)).length;
        setNewCount(count);
      }
      const timer = setTimeout(() => {
        localStorage.setItem('admin_last_seen', new Date().toISOString());
        setNewCount(0);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [partnerships]);

  const handleStatusChange = async (id, status) => {
    try {
      await fetch(`${API_URL}/api/admin/partnerships/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      fetchData();
      if (selectedPartnership?.id === id) {
        setSelectedPartnership(prev => ({ ...prev, status }));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this partnership application?')) return;
    try {
      await fetch(`${API_URL}/api/admin/partnerships/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      fetchData();
      if (selectedPartnership?.id === id) setSelectedPartnership(null);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Organization', 'Contact Name', 'Email', 'Phone', 'Org Type', 'Term', 'Officials', 'Rate', 'Discount', 'Status', 'Submitted'];
    const rows = partnerships.map(p => [
      p.partnerOrgName || '',
      p.contactName || '',
      p.contactEmail || '',
      p.contactPhone || '',
      p.orgType || '',
      p.termStructure || '',
      p.numOfficials || '',
      p.perUserRate || '',
      p.pilotDiscount || '',
      p.status || '',
      p.created_at ? new Date(p.created_at).toLocaleDateString() : '',
    ]);
    const csvContent = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iWhistle-Partnerships-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const filtered = partnerships.filter(p => {
    const matchesSearch = !searchTerm ||
      p.partnerOrgName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900" data-testid="admin-dashboard">
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/portal" className="flex items-center gap-2 text-gray-500 hover:text-iwhistle-blue transition-colors" data-testid="admin-back-link">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline text-sm">Back to Portal</span>
              </Link>
              <div className="h-6 w-px bg-gray-200 dark:bg-slate-600" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <span className="text-white font-bold text-sm">i</span>
                </div>
                <h1 className="text-lg font-bold text-iwhistle-deep dark:text-white">Admin Dashboard</h1>
              </div>
              {newCount > 0 && (
                <div
                  data-testid="new-applications-badge"
                  className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-full text-xs font-medium text-amber-700 dark:text-amber-400"
                >
                  <Bell className="w-3.5 h-3.5" />
                  {newCount} new application{newCount !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleExportCSV} disabled={loading || partnerships.length === 0} data-testid="export-csv-btn"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-iwhistle-blue bg-iwhistle-blue/10 rounded-lg hover:bg-iwhistle-blue/20 transition-colors disabled:opacity-50">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={toggleTheme}
                data-testid="admin-theme-toggle"
                aria-label="Toggle dark mode"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={fetchData} disabled={loading} data-testid="refresh-btn"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button onClick={handleLogout} data-testid="admin-logout-btn"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} label="Total Applications" value={stats.total} color="gradient-primary" />
          <StatCard icon={Clock} label="Pending Review" value={stats.pending} color="bg-amber-500" />
          <StatCard icon={CheckCircle} label="Approved" value={stats.approved} color="bg-green-500" />
          <StatCard icon={DollarSign} label="Total Value" value={`$${stats.total_value.toLocaleString()}`} color="bg-iwhistle-blue" />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by organization, contact name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="admin-search-input"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:border-iwhistle-blue focus:ring-2 focus:ring-iwhistle-blue/20 outline-none transition-all text-sm"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              data-testid="filter-btn"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              {statusFilter === 'all' ? 'All Status' : statusConfig[statusFilter]?.label}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1">
                {['all', 'pending', 'approved', 'rejected'].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setShowFilterMenu(false); }}
                    data-testid={`filter-option-${s}`}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${statusFilter === s ? 'text-iwhistle-blue font-medium' : 'text-gray-600'}`}
                  >
                    {s === 'all' ? 'All Status' : statusConfig[s].label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20" data-testid="admin-loading">
              <div className="w-8 h-8 border-4 border-iwhistle-blue/20 border-t-iwhistle-blue rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20" data-testid="admin-empty">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No partnership applications found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'Applications will appear here when submitted'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="admin-partnerships-table">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Organization</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Officials</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((p, idx) => {
                    const cfg = statusConfig[p.status] || statusConfig.pending;
                    const StatusIcon = cfg.icon;
                    return (
                      <motion.tr
                        key={p.id || idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors"
                        data-testid={`partnership-row-${idx}`}
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-iwhistle-deep text-sm">{p.partnerOrgName}</div>
                          <div className="text-xs text-gray-400">{p.orgType}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{p.contactName}</div>
                          <div className="text-xs text-gray-400">{p.contactEmail}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{p.numOfficials || '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setSelectedPartnership(p)} title="View Details" data-testid={`view-btn-${idx}`}
                              className="p-2 text-gray-400 hover:text-iwhistle-blue hover:bg-iwhistle-blue/10 rounded-lg transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(p.id)} title="Delete" data-testid={`delete-btn-${idx}`}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-6">
          Showing {filtered.length} of {partnerships.length} applications
        </p>

        {/* Partner Inquiries Section */}
        <div className="mt-6">
          <button
            onClick={() => { setShowInquiries(!showInquiries); if (!showInquiries && inquiries.length === 0) fetchInquiries(); }}
            data-testid="toggle-inquiries-btn"
            className="flex items-center gap-3 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-iwhistle-blue" />
            <span className="font-semibold text-iwhistle-deep dark:text-white text-sm">Partner Inquiries</span>
            {inquiries.filter((i) => i.status === 'unread').length > 0 && (
              <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-medium px-2 py-0.5 rounded-full">
                {inquiries.filter((i) => i.status === 'unread').length} unread
              </span>
            )}
            <ChevronDown className={`w-4 h-4 text-gray-400 ml-auto transition-transform duration-200 ${showInquiries ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showInquiries && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                  {inquiriesLoading ? (
                    <div className="flex items-center justify-center py-10" data-testid="inquiries-loading">
                      <div className="w-6 h-6 border-3 border-iwhistle-blue/20 border-t-iwhistle-blue rounded-full animate-spin" />
                    </div>
                  ) : inquiries.length === 0 ? (
                    <div className="text-center py-10" data-testid="no-inquiries">
                      <MessageSquare className="w-10 h-10 text-gray-200 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No inquiries yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-slate-700">
                      {inquiries.map((inq, idx) => (
                        <div
                          key={inq.id || idx}
                          data-testid={`inquiry-row-${idx}`}
                          className={`p-4 flex items-start gap-4 transition-colors ${
                            inq.status === 'unread'
                              ? 'bg-amber-50/50 dark:bg-amber-900/10'
                              : 'hover:bg-gray-50 dark:hover:bg-slate-700/30'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${inq.status === 'unread' ? 'bg-amber-400' : 'bg-gray-300 dark:bg-gray-600'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-iwhistle-deep dark:text-white">{inq.subject}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-iwhistle-blue/10 text-iwhistle-blue capitalize">{inq.category}</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{inq.message}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              From <span className="font-medium">{inq.user_name}</span> ({inq.organization}) · {inq.created_at ? new Date(inq.created_at).toLocaleDateString() : ''}
                            </p>
                          </div>
                          {inq.status === 'unread' && (
                            <button
                              onClick={() => markInquiryRead(inq.id)}
                              data-testid={`mark-read-btn-${idx}`}
                              className="flex-shrink-0 text-xs text-iwhistle-blue hover:underline font-medium"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {selectedPartnership && (
          <PartnershipDetailModal
            partnership={selectedPartnership}
            onClose={() => setSelectedPartnership(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
