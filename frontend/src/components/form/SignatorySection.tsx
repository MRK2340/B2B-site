import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Input } from '../ui/input';
import { FormField } from './FormField';
import type { PartnershipFormData } from '../../types';

interface Props {
  formData: PartnershipFormData;
  errors: Record<string, string>;
  handleChange: (field: string, value: string) => void;
  errorBorder: (field: string) => string;
}

export function SignatorySection({ formData, errors, handleChange, errorBorder }: Props) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-iwhistle-deep mb-4 flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-iwhistle-blue" /> Authorized Signatory
      </h3>
      <div className="grid sm:grid-cols-3 gap-4">
        <FormField label="Full Name" id="signerName" error={errors.signerName}>
          <Input id="signerName" value={formData.signerName}
            onChange={(e) => handleChange('signerName', e.target.value)}
            placeholder="Authorized Signer Name"
            className={`mt-1 ${errorBorder('signerName')}`} />
        </FormField>
        <FormField label="Title" id="signerTitle" error={errors.signerTitle}>
          <Input id="signerTitle" value={formData.signerTitle}
            onChange={(e) => handleChange('signerTitle', e.target.value)}
            placeholder="President/CEO"
            className={`mt-1 ${errorBorder('signerTitle')}`} />
        </FormField>
        <FormField label="Date" id="signatureDate" error={errors.signatureDate}>
          <Input id="signatureDate" type="date" value={formData.signatureDate}
            onChange={(e) => handleChange('signatureDate', e.target.value)}
            className={`mt-1 ${errorBorder('signatureDate')}`} />
        </FormField>
      </div>
    </div>
  );
}
