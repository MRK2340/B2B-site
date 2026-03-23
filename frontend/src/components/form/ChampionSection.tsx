import React from 'react';
import { Users } from 'lucide-react';
import { Input } from '../ui/input';
import { FormField } from './FormField';
import type { PartnershipFormData } from '../../types';

interface Props {
  formData: PartnershipFormData;
  errors: Record<string, string>;
  handleChange: (field: string, value: string) => void;
  errorBorder: (field: string) => string;
}

export function ChampionSection({ formData, errors, handleChange, errorBorder }: Props) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-iwhistle-deep mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-iwhistle-blue" /> Partner Champion
        <span className="text-sm font-normal text-gray-500">(Primary Point of Contact)</span>
      </h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <FormField label="Full Name" id="championName" error={errors.championName}>
          <Input id="championName" value={formData.championName}
            onChange={(e) => handleChange('championName', e.target.value)}
            placeholder="Jane Doe"
            className={`mt-1 ${errorBorder('championName')}`} />
        </FormField>
        <FormField label="Title" id="championTitle" error={errors.championTitle}>
          <Input id="championTitle" value={formData.championTitle}
            onChange={(e) => handleChange('championTitle', e.target.value)}
            placeholder="Referee Coordinator"
            className={`mt-1 ${errorBorder('championTitle')}`} />
        </FormField>
        <FormField label="Email" id="championEmail" error={errors.championEmail}>
          <Input id="championEmail" type="email" value={formData.championEmail}
            onChange={(e) => handleChange('championEmail', e.target.value)}
            placeholder="jane@example.com"
            className={`mt-1 ${errorBorder('championEmail')}`} />
        </FormField>
        <FormField label="Phone" id="championPhone" error={errors.championPhone}>
          <Input id="championPhone" type="tel" value={formData.championPhone}
            onChange={(e) => handleChange('championPhone', e.target.value)}
            placeholder="(555) 987-6543"
            className={`mt-1 ${errorBorder('championPhone')}`} />
        </FormField>
      </div>
    </div>
  );
}
