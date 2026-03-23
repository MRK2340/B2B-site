import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Label } from '../ui/label';

interface FormFieldProps {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}

export function FormField({ label, id, error, children, required = true }: FormFieldProps) {
  return (
    <div>
      <Label htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-1 mt-1 text-xs text-red-500"
            data-testid={`error-${id}`}
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
