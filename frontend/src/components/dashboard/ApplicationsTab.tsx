import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCheck2, RefreshCw, Eye, PenLine, Loader2 } from 'lucide-react';
import { STATUS_CONFIG } from '../../constants';
import { AppDetailModal } from './AppDetailModal';
import type { Partnership } from '../../types';

interface Props {
  applications: Partnership[];
  loading: boolean;
  onRefresh: () => void;
  setActiveTab: (tab: string) => void;
}

export function ApplicationsTab({ applications, loading, onRefresh, setActiveTab }: Props) {
  const [selected, setSelected] = useState<Partnership | null>(null);

  return (
    <div className="p-6 lg:p-8" data-testid="applications-tab">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-iwhistle-deep">My Applications</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {applications.length} application{applications.length !== 1 ? 's' : ''} submitted
          </p>
        </div>
        <button onClick={onRefresh} disabled={loading} data-testid="refresh-apps-btn"
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-iwhistle-blue animate-spin" />
        </div>
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
                  const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.pending;
                  const StatusIcon = cfg.icon;
                  return (
                    <motion.tr key={app.id || idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.04 }}
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
