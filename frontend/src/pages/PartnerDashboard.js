import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileCheck2, BookOpen, PenLine, X, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PartnershipForm } from '../sections/PartnershipForm';
import { OverviewTab } from '../components/dashboard/OverviewTab';
import { ApplicationsTab } from '../components/dashboard/ApplicationsTab';
import { DocumentsTab } from '../components/dashboard/DocumentsTab';
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'applications', label: 'My Applications', icon: FileCheck2 },
  { id: 'documents', label: 'Documents', icon: BookOpen },
  { id: 'apply', label: 'Apply Now', icon: PenLine },
];

export default function PartnerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

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
  useEffect(() => {
    if (activeTab === 'applications') fetchApplications();
  }, [activeTab, fetchApplications]);

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  const handleLogout = () => { logout(); window.location.href = '/'; };

  const sidebarProps = {
    navItems,
    activeTab,
    pendingCount: stats.pending,
    user,
    onLogout: handleLogout,
  };

  return (
    <div className="min-h-screen flex bg-gray-50" data-testid="partner-dashboard">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-iwhistle-deep fixed inset-y-0 left-0 z-40">
        <DashboardSidebar {...sidebarProps} onTabChange={setActiveTab} />
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
              <DashboardSidebar
                {...sidebarProps}
                onTabChange={(tab) => { setActiveTab(tab); setMobileSidebarOpen(false); }}
              />
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

        {/* Desktop page header */}
        <div className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
          <h1 className="text-lg font-bold text-iwhistle-deep">{navItems.find(n => n.id === activeTab)?.label}</h1>
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
