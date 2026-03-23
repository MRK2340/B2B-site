import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STATUS_CONFIG } from '../../constants';
import type { Partnership, PartnershipStatus } from '../../types';
import { calculateTotal } from '../../utils/validation';

interface Props {
  partnership: Partnership | null;
  onClose: () => void;
  onStatusChange: (id: string, status: PartnershipStatus) => void;
}

function DetailSection({ title, items }: { title: string; items: [string, string | undefined][] }) {
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

export function PartnershipDetailModal({ partnership, onClose, onStatusChange }: Props) {
  if (!partnership) return null;
  const total = calculateTotal(
    partnership.perUserRate,
    partnership.numOfficials,
    partnership.termStructure,
    partnership.pilotDiscount ?? ''
  );

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
          <p className="text-white/70 text-sm mt-1">
            Submitted {new Date(partnership.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex gap-2">
            {(['pending', 'approved', 'rejected'] as PartnershipStatus[]).map((s) => {
              const cfg = STATUS_CONFIG[s];
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

          <DetailSection title="Signatory" items={[
            ['Name', partnership.signerName],
            ['Title', partnership.signerTitle],
            ['Date', partnership.signatureDate],
          ]} />
        </div>
      </motion.div>
    </motion.div>
  );
}
