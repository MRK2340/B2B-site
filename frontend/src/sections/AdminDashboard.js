import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, DollarSign, Clock, CheckCircle, Download, RefreshCw, Search, Filter, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/admin/StatCard';
import { PartnershipDetailModal } from '../components/admin/PartnershipDetailModal';
import { PartnershipTable } from '../components/admin/PartnershipTable';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export function AdminDashboard() {
  const [partnerships, setPartnerships] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, total_value: 0, total_officials: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedPartnership, setSelectedPartnership] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

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

  useEffect(() => { fetchData(); }, [fetchData]);

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
      await fetch(`${API_URL}/api/admin/partnerships/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
      if (selectedPartnership?.id === id) setSelectedPartnership(null);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Organization', 'Contact Name', 'Email', 'Phone', 'Org Type', 'Term', 'Officials', 'Rate', 'Discount', 'Status', 'Submitted'];
    const rows = partnerships.map(p => [
      p.partnerOrgName || '', p.contactName || '', p.contactEmail || '', p.contactPhone || '',
      p.orgType || '', p.termStructure || '', p.numOfficials || '', p.perUserRate || '',
      p.pilotDiscount || '', p.status || '',
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

  const handleLogout = () => { logout(); window.location.href = '/'; };

  const statusFilterOptions = ['all', 'pending', 'approved', 'rejected'];

  return (
    <div className="min-h-screen bg-gray-50" data-testid="admin-dashboard">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/portal" className="flex items-center gap-2 text-gray-500 hover:text-iwhistle-blue transition-colors" data-testid="admin-back-link">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline text-sm">Back to Portal</span>
              </Link>
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <span className="text-white font-bold text-sm">i</span>
                </div>
                <h1 className="text-lg font-bold text-iwhistle-deep">Admin Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleExportCSV} disabled={loading || partnerships.length === 0} data-testid="export-csv-btn"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-iwhistle-blue bg-iwhistle-blue/10 rounded-lg hover:bg-iwhistle-blue/20 transition-colors disabled:opacity-50">
                <Download className="w-4 h-4" /> Export CSV
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
            <input type="text" placeholder="Search by organization, contact name, or email..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="admin-search-input"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-iwhistle-blue focus:ring-2 focus:ring-iwhistle-blue/20 outline-none transition-all text-sm" />
          </div>
          <div className="relative">
            <button onClick={() => setShowFilterMenu(!showFilterMenu)} data-testid="filter-btn"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              {statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1">
                {statusFilterOptions.map((s) => (
                  <button key={s} onClick={() => { setStatusFilter(s); setShowFilterMenu(false); }}
                    data-testid={`filter-option-${s}`}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${statusFilter === s ? 'text-iwhistle-blue font-medium' : 'text-gray-600'}`}>
                    {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <PartnershipTable
            partnerships={partnerships}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            loading={loading}
            onView={setSelectedPartnership}
            onDelete={handleDelete}
          />
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
