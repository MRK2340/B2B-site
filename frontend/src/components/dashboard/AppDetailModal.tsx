import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { STATUS_CONFIG } from '../../constants';
import type { Partnership } from '../../types';
import { calculateTotal } from '../../utils/validation';

interface Props {
  app: Partnership | null;
  onClose: () => void;
}

export function AppDetailModal({ app, onClose }: Props) {
  if (!app) return null;
  const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const total = calculateTotal(app.perUserRate, app.numOfficials, app.termStructure, app.pilotDiscount ?? '');

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
            {([
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
            ] as [string, string][]).map(([label, value]) => (
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
        </div>
      </motion.div>
    </motion.div>
  );
}
