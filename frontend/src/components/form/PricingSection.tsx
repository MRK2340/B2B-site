import React from 'react';
import { FileText } from 'lucide-react';
import { Input } from '../ui/input';
import { FormField } from './FormField';
import { calculateTotal } from '../../utils/validation';
import type { PartnershipFormData } from '../../types';

interface Props {
  formData: PartnershipFormData;
  errors: Record<string, string>;
  handleChange: (field: string, value: string) => void;
  errorBorder: (field: string) => string;
}

export function PricingSection({ formData, errors, handleChange, errorBorder }: Props) {
  const total = calculateTotal(
    formData.perUserRate,
    formData.numOfficials,
    formData.termStructure,
    formData.pilotDiscount
  );

  return (
    <div>
      <h3 className="text-lg font-semibold text-iwhistle-deep mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-iwhistle-blue" /> Pricing Details
      </h3>
      <div className="grid sm:grid-cols-3 gap-4">
        <FormField label="Per-User Monthly Rate ($)" id="perUserRate" error={errors.perUserRate}>
          <Input id="perUserRate" type="number" min="0" step="0.01" value={formData.perUserRate}
            onChange={(e) => handleChange('perUserRate', e.target.value)}
            placeholder="8.00"
            className={`mt-1 ${errorBorder('perUserRate')}`} />
        </FormField>
        <FormField label="Pilot Conversion Discount (%)" id="pilotDiscount" error={errors.pilotDiscount} required={false}>
          <Input id="pilotDiscount" type="number" min="0" max="100" value={formData.pilotDiscount}
            onChange={(e) => handleChange('pilotDiscount', e.target.value)}
            placeholder="15"
            className={`mt-1 ${errorBorder('pilotDiscount')}`} />
        </FormField>
        <div className="flex items-end">
          <div className="bg-iwhistle-blue/10 rounded-lg px-4 py-3 w-full" data-testid="estimated-total">
            <span className="text-sm text-gray-600">Estimated Total:</span>
            <div className="text-2xl font-bold text-iwhistle-blue">${total}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
