import { Clock, CheckCircle, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { PartnershipStatus } from './types';

export interface StatusConfigEntry {
  label: string;
  color: string;
  icon: LucideIcon;
}

export const STATUS_CONFIG: Record<PartnershipStatus, StatusConfigEntry> = {
  pending: {
    label: 'Pending Review',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: Clock,
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
};
