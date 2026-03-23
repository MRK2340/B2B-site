import React from 'react';
import { Building2 } from 'lucide-react';
import { Input } from '../ui/input';
import { FormField } from './FormField';
import type { PartnershipFormData } from '../../types';

interface Props {
  formData: PartnershipFormData;
  errors: Record<string, string>;
  handleChange: (field: string, value: string) => void;
  errorBorder: (field: string) => string;
}

export function OrganizationSection({ formData, errors, handleChange, errorBorder }: Props) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-iwhistle-deep mb-4 flex items-center gap-2">
        <Building2 className="w-5 h-5 text-iwhistle-blue" /> Organization Information
      </h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <FormField label="Organization Legal Name" id="partnerOrgName" error={errors.partnerOrgName}>
            <Input id="partnerOrgName" data-testid="input-org-name" value={formData.partnerOrgName}
              onChange={(e) => handleChange('partnerOrgName', e.target.value)}
              placeholder="e.g., Youth Basketball League of Chicago"
              className={`mt-1 ${errorBorder('partnerOrgName')}`} />
          </FormField>
        </div>
        <FormField label="Entity Type" id="partnerEntityType" error={errors.partnerEntityType}>
          <Input id="partnerEntityType" value={formData.partnerEntityType}
            onChange={(e) => handleChange('partnerEntityType', e.target.value)}
            placeholder="e.g., Nonprofit Corporation"
            className={`mt-1 ${errorBorder('partnerEntityType')}`} />
        </FormField>
        <FormField label="Organization Type" id="orgType" error={errors.orgType}>
          <Input id="orgType" value={formData.orgType}
            onChange={(e) => handleChange('orgType', e.target.value)}
            placeholder="e.g., Youth League, Camp/Clinic"
            className={`mt-1 ${errorBorder('orgType')}`} />
        </FormField>
        <div className="sm:col-span-2">
          <FormField label="Street Address" id="partnerAddress" error={errors.partnerAddress}>
            <Input id="partnerAddress" value={formData.partnerAddress}
              onChange={(e) => handleChange('partnerAddress', e.target.value)}
              placeholder="123 Main Street"
              className={`mt-1 ${errorBorder('partnerAddress')}`} />
          </FormField>
        </div>
        <FormField label="City" id="partnerCity" error={errors.partnerCity}>
          <Input id="partnerCity" value={formData.partnerCity}
            onChange={(e) => handleChange('partnerCity', e.target.value)}
            placeholder="Chicago"
            className={`mt-1 ${errorBorder('partnerCity')}`} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="State" id="partnerState" error={errors.partnerState}>
            <Input id="partnerState" value={formData.partnerState}
              onChange={(e) => handleChange('partnerState', e.target.value)}
              placeholder="IL"
              className={`mt-1 ${errorBorder('partnerState')}`} />
          </FormField>
          <FormField label="ZIP" id="partnerZip" error={errors.partnerZip}>
            <Input id="partnerZip" value={formData.partnerZip}
              onChange={(e) => handleChange('partnerZip', e.target.value)}
              placeholder="60601"
              className={`mt-1 ${errorBorder('partnerZip')}`} />
          </FormField>
        </div>
      </div>
    </div>
  );
}
