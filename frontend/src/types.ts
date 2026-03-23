// Shared types for the iWhistle B2B portal

export type UserRole = 'admin' | 'partner';
export type PartnershipStatus = 'pending' | 'approved' | 'rejected';
export type TermStructure = 'annual' | 'seasonal';

export interface User {
  email: string;
  name: string;
  role: UserRole;
  organization: string;
}

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export interface PartnershipFormData {
  partnerOrgName: string;
  partnerEntityType: string;
  partnerState: string;
  partnerAddress: string;
  partnerCity: string;
  partnerZip: string;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  contactPhone: string;
  termStructure: TermStructure;
  startDate: string;
  endDate: string;
  numOfficials: string;
  orgType: string;
  championName: string;
  championTitle: string;
  championEmail: string;
  championPhone: string;
  signerName: string;
  signerTitle: string;
  signatureDate: string;
  perUserRate: string;
  pilotDiscount: string;
}

export interface Partnership extends PartnershipFormData {
  id: string;
  status: PartnershipStatus;
  submitted_by: string;
  created_at: string;
  updated_at?: string;
  signature?: string;
}

export interface AdminStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  total_value: number;
  total_officials: number;
}
