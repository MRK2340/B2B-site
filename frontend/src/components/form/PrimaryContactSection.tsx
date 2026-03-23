import React from 'react';
import { User } from 'lucide-react';
import { Input } from '../ui/input';
import { FormField } from './FormField';
import type { PartnershipFormData } from '../../types';

interface Props {
  formData: PartnershipFormData;
  errors: Record<string, string>;
  handleChange: (field: string, value: string) => void;
  errorBorder: (field: string) => string;
}

export function PrimaryContactSection({ formData, errors, handleChange, errorBorder }: Props) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-iwhistle-deep mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-iwhistle-blue" /> Primary Contact
      </h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <FormField label="Full Name" id="contactName" error={errors.contactName}>
          <Input id="contactName" data-testid="input-contact-name" value={formData.contactName}
            onChange={(e) => handleChange('contactName', e.target.value)}
            placeholder="John Smith"
            className={`mt-1 ${errorBorder('contactName')}`} />
        </FormField>
        <FormField label="Title" id="contactTitle" error={errors.contactTitle}>
          <Input id="contactTitle" value={formData.contactTitle}
            onChange={(e) => handleChange('contactTitle', e.target.value)}
            placeholder="Executive Director"
            className={`mt-1 ${errorBorder('contactTitle')}`} />
        </FormField>
        <FormField label="Email" id="contactEmail" error={errors.contactEmail}>
          <Input id="contactEmail" data-testid="input-contact-email" type="email" value={formData.contactEmail}
            onChange={(e) => handleChange('contactEmail', e.target.value)}
            placeholder="john@example.com"
            className={`mt-1 ${errorBorder('contactEmail')}`} />
        </FormField>
        <FormField label="Phone" id="contactPhone" error={errors.contactPhone}>
          <Input id="contactPhone" type="tel" value={formData.contactPhone}
            onChange={(e) => handleChange('contactPhone', e.target.value)}
            placeholder="(555) 123-4567"
            className={`mt-1 ${errorBorder('contactPhone')}`} />
        </FormField>
      </div>
    </div>
  );
}
