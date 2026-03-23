import React from 'react';
import { Calendar } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { FormField } from './FormField';
import type { PartnershipFormData } from '../../types';

interface Props {
  formData: PartnershipFormData;
  errors: Record<string, string>;
  handleChange: (field: string, value: string) => void;
  errorBorder: (field: string) => string;
}

export function ProgramDetailsSection({ formData, errors, handleChange, errorBorder }: Props) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-iwhistle-deep mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-iwhistle-blue" /> Program Details
      </h3>
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Term Structure <span className="text-red-500">*</span></Label>
          <RadioGroup
            value={formData.termStructure}
            onValueChange={(value) => handleChange('termStructure', value)}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="annual" id="annual" />
              <Label htmlFor="annual" className="cursor-pointer">Annual (12 months)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="seasonal" id="seasonal" />
              <Label htmlFor="seasonal" className="cursor-pointer">Seasonal (3-6 months)</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <FormField label="Start Date" id="startDate" error={errors.startDate}>
            <Input id="startDate" type="date" value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className={`mt-1 ${errorBorder('startDate')}`} />
          </FormField>
          <FormField label="End Date" id="endDate" error={errors.endDate}>
            <Input id="endDate" type="date" value={formData.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className={`mt-1 ${errorBorder('endDate')}`} />
          </FormField>
          <FormField label="Number of Officials" id="numOfficials" error={errors.numOfficials}>
            <Input id="numOfficials" type="number" min="10" value={formData.numOfficials}
              onChange={(e) => handleChange('numOfficials', e.target.value)}
              placeholder="25"
              className={`mt-1 ${errorBorder('numOfficials')}`} />
          </FormField>
        </div>
      </div>
    </div>
  );
}
