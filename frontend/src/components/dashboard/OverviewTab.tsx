import React from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, CheckCircle, XCircle, ChevronRight, LayoutDashboard, PenLine, BookOpen, FileCheck2, Building2 } from 'lucide-react';
import { STATUS_CONFIG } from '../../constants';
import type { User, Partnership } from '../../types';

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface Props {
  user: User | null;
  stats: Stats;
  applications: Partnership[];
  setActiveTab: (tab: string) => void;
}

export function OverviewTab({ user, stats, applications, setActiveTab }: Props) {
  const latestApp = applications[0];
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-6 lg:p-8 space-y-8" data-testid="overview-tab">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-iwhistle-deep to-iwhistle-blue rounded-2xl p-7 text-white">
        <p className="text-white/70 text-sm mb-1">{greeting()},</p>
        <h1 className="text-2xl font-bold mb-1">{user?.name}</h1>
        <p className="text-white/80 text-sm flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          {user?.organization}
        </p>
        {latestApp && (
          <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${STATUS_CONFIG[latestApp.status]?.color ?? STATUS_CONFIG.pending.color}`}>
            Latest application: <span className="font-semibold">{latestApp.partnerOrgName}</span>
            &mdash; {STATUS_CONFIG[latestApp.status]?.label}
          </div>
        )}
      </motion.div>

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
