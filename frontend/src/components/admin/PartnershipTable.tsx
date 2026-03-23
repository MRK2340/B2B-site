import React from 'react';
import { motion } from 'framer-motion';
import { Users, Eye, Trash2 } from 'lucide-react';
import { STATUS_CONFIG } from '../../constants';
import type { Partnership } from '../../types';

interface Props {
  partnerships: Partnership[];
  searchTerm: string;
  statusFilter: string;
  loading: boolean;
  onView: (p: Partnership) => void;
  onDelete: (id: string) => void;
}

export function PartnershipTable({ partnerships, searchTerm, statusFilter, loading, onView, onDelete }: Props) {
  const filtered = partnerships.filter((p) => {
    const matchesSearch = !searchTerm ||
      p.partnerOrgName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" data-testid="admin-loading">
        <div className="w-8 h-8 border-4 border-iwhistle-blue/20 border-t-iwhistle-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center py-20" data-testid="admin-empty">
        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">No partnership applications found</p>
        <p className="text-gray-400 text-sm mt-1">
          {searchTerm || statusFilter !== 'all'
            ? 'Try adjusting your search or filters'
            : 'Applications will appear here when submitted'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full" data-testid="admin-partnerships-table">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
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
              const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.pending;
              const StatusIcon = cfg.icon;
              return (
                <motion.tr key={p.id || idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-gray-50/50 transition-colors"
                  data-testid={`partnership-row-${idx}`}>
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
                      <button onClick={() => onView(p)} title="View Details" data-testid={`view-btn-${idx}`}
                        className="p-2 text-gray-400 hover:text-iwhistle-blue hover:bg-iwhistle-blue/10 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(p.id)} title="Delete" data-testid={`delete-btn-${idx}`}
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
      <p className="text-center text-sm text-gray-400 mt-6">
        Showing {filtered.length} of {partnerships.length} applications
      </p>
    </>
  );
}
