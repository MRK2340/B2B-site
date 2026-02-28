import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Download, CheckCircle, Building2, Users, Calendar, User, FileText, AlertCircle, Send } from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Separator } from '../components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const initialFormData = {
  partnerOrgName: '', partnerEntityType: '', partnerState: '', partnerAddress: '',
  partnerCity: '', partnerZip: '', contactName: '', contactTitle: '', contactEmail: '',
  contactPhone: '', termStructure: 'annual', startDate: '', endDate: '', numOfficials: '',
  orgType: '', championName: '', championTitle: '', championEmail: '', championPhone: '',
  signerName: '', signerTitle: '', signatureDate: new Date().toISOString().split('T')[0],
  perUserRate: '', pilotDiscount: '',
};

const requiredFields = {
  partnerOrgName: 'Organization Legal Name',
  partnerEntityType: 'Entity Type',
  orgType: 'Organization Type',
  partnerAddress: 'Street Address',
  partnerCity: 'City',
  partnerState: 'State',
  partnerZip: 'ZIP Code',
  contactName: 'Contact Full Name',
  contactTitle: 'Contact Title',
  contactEmail: 'Contact Email',
  contactPhone: 'Contact Phone',
  startDate: 'Start Date',
  endDate: 'End Date',
  numOfficials: 'Number of Officials',
  championName: 'Champion Full Name',
  championTitle: 'Champion Title',
  championEmail: 'Champion Email',
  championPhone: 'Champion Phone',
  perUserRate: 'Per-User Monthly Rate',
  signerName: 'Signer Full Name',
  signerTitle: 'Signer Title',
  signatureDate: 'Signature Date',
};

function FormField({ label, id, error, children, required = true }) {
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

export function PartnershipForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('form');

  useEffect(() => {
    const saved = localStorage.getItem('iwhistlePartnershipForm');
    if (saved) {
      try { setFormData(prev => ({ ...prev, ...JSON.parse(saved) })); }
      catch (e) { console.error('Failed to load saved form data'); }
    }
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
    if (errors[field]) {
      setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => phone.replace(/\D/g, '').length >= 7;

  const validate = (fieldsToCheck = null) => {
    const newErrors = {};
    const fields = fieldsToCheck || Object.keys(requiredFields);

    fields.forEach(field => {
      if (requiredFields[field] && !formData[field]?.toString().trim()) {
        newErrors[field] = `${requiredFields[field]} is required`;
      }
    });

    if (formData.contactEmail && !validateEmail(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }
    if (formData.championEmail && !validateEmail(formData.championEmail)) {
      newErrors.championEmail = 'Please enter a valid email address';
    }
    if (formData.contactPhone && !validatePhone(formData.contactPhone)) {
      newErrors.contactPhone = 'Please enter a valid phone number';
    }
    if (formData.championPhone && !validatePhone(formData.championPhone)) {
      newErrors.championPhone = 'Please enter a valid phone number';
    }
    if (formData.numOfficials && parseInt(formData.numOfficials) < 10) {
      newErrors.numOfficials = 'Minimum 10 officials required';
    }
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (formData.perUserRate && parseFloat(formData.perUserRate) <= 0) {
      newErrors.perUserRate = 'Rate must be greater than 0';
    }
    if (formData.pilotDiscount && (parseFloat(formData.pilotDiscount) < 0 || parseFloat(formData.pilotDiscount) > 100)) {
      newErrors.pilotDiscount = 'Discount must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    localStorage.setItem('iwhistlePartnershipForm', JSON.stringify(formData));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const calculateTotal = () => {
    const rate = parseFloat(formData.perUserRate) || 0;
    const officials = parseInt(formData.numOfficials) || 0;
    const months = formData.termStructure === 'annual' ? 12 : 4;
    const discount = parseFloat(formData.pilotDiscount) || 0;
    return (rate * officials * months * (1 - discount / 100)).toFixed(2);
  };

  const generateAgreementText = () => `iWHISTLE
INSTITUTIONAL PARTNERSHIP AGREEMENT

Effective Date: ${formData.signatureDate || '[Date]'}

PARTIES:
iWhistle, LLC ("Provider")
and
${formData.partnerOrgName || '[Partner Organization]'} ("Partner")
a ${formData.partnerEntityType || '[Entity Type]'} organized under the laws of ${formData.partnerState || '[State]'}
Address: ${formData.partnerAddress || '[Address]'}, ${formData.partnerCity || '[City]'}, ${formData.partnerState || '[State]'} ${formData.partnerZip || '[ZIP]'}

PROGRAM DETAILS:
Organization Type: ${formData.orgType || '[Type]'}
Term Structure: ${formData.termStructure === 'annual' ? 'Annual (12 months)' : 'Seasonal (3-6 months)'}
Subscription Period: ${formData.startDate || '[Start Date]'} to ${formData.endDate || '[End Date]'}
Number of Authorized Users: ${formData.numOfficials || '[Number]'}

PRICING:
Per-User Monthly Rate: $${formData.perUserRate || '[Rate]'}
Pilot Conversion Discount: ${formData.pilotDiscount ? formData.pilotDiscount + '%' : 'None'}
Total Agreement Value: $${calculateTotal()}

PARTNER CHAMPION:
Name: ${formData.championName || '[Name]'}
Title: ${formData.championTitle || '[Title]'}
Email: ${formData.championEmail || '[Email]'}
Phone: ${formData.championPhone || '[Phone]'}

PRIMARY CONTACT:
Name: ${formData.contactName || '[Name]'}
Title: ${formData.contactTitle || '[Title]'}
Email: ${formData.contactEmail || '[Email]'}
Phone: ${formData.contactPhone || '[Phone]'}

AUTHORIZED SIGNATORY:
Name: ${formData.signerName || '[Name]'}
Title: ${formData.signerTitle || '[Title]'}
Date: ${formData.signatureDate || '[Date]'}

This agreement is subject to iWhistle's standard Institutional Partnership Agreement terms and conditions.
`;

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let y = 20;

    // Header gradient bar
    doc.setFillColor(0, 61, 122);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setFillColor(0, 128, 200);
    doc.rect(pageWidth * 0.6, 0, pageWidth * 0.4, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('iWhistle', margin, 22);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('INSTITUTIONAL PARTNERSHIP AGREEMENT', margin, 33);

    y = 55;
    doc.setTextColor(0, 61, 122);
    doc.setFontSize(10);
    doc.text(`Effective Date: ${formData.signatureDate || '[Date]'}`, margin, y);
    y += 15;

    const addSection = (title, items) => {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFillColor(0, 61, 122);
      doc.rect(margin, y - 5, maxWidth, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin + 3, y + 1);
      y += 10;

      doc.setTextColor(50, 50, 50);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      items.forEach(([label, value]) => {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(value || '[Not provided]', margin + 50, y);
        y += 6;
      });
      y += 6;
    };

    addSection('PARTIES', [
      ['Provider', 'iWhistle, LLC'],
      ['Partner', formData.partnerOrgName || '[Partner Organization]'],
      ['Entity Type', formData.partnerEntityType || '[Entity Type]'],
      ['State', formData.partnerState || '[State]'],
      ['Address', `${formData.partnerAddress || ''}, ${formData.partnerCity || ''}, ${formData.partnerState || ''} ${formData.partnerZip || ''}`],
    ]);

    addSection('PROGRAM DETAILS', [
      ['Org Type', formData.orgType || '[Type]'],
      ['Term', formData.termStructure === 'annual' ? 'Annual (12 months)' : 'Seasonal (3-6 months)'],
      ['Period', `${formData.startDate || '[Start]'} to ${formData.endDate || '[End]'}`],
      ['Users', formData.numOfficials || '[Number]'],
    ]);

    addSection('PRICING', [
      ['Per-User Rate', `$${formData.perUserRate || '[Rate]'}/month`],
      ['Discount', formData.pilotDiscount ? `${formData.pilotDiscount}%` : 'None'],
      ['Total Value', `$${calculateTotal()}`],
    ]);

    addSection('PARTNER CHAMPION', [
      ['Name', formData.championName || '[Name]'],
      ['Title', formData.championTitle || '[Title]'],
      ['Email', formData.championEmail || '[Email]'],
      ['Phone', formData.championPhone || '[Phone]'],
    ]);

    addSection('PRIMARY CONTACT', [
      ['Name', formData.contactName || '[Name]'],
      ['Title', formData.contactTitle || '[Title]'],
      ['Email', formData.contactEmail || '[Email]'],
      ['Phone', formData.contactPhone || '[Phone]'],
    ]);

    addSection('AUTHORIZED SIGNATORY', [
      ['Name', formData.signerName || '[Name]'],
      ['Title', formData.signerTitle || '[Title]'],
      ['Date', formData.signatureDate || '[Date]'],
    ]);

    // Signature lines
    if (y > 240) { doc.addPage(); y = 20; }
    y += 10;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('Signature lines:', margin, y);
    y += 12;
    doc.setDrawColor(150, 150, 150);
    doc.line(margin, y, margin + 70, y);
    doc.line(pageWidth / 2 + 10, y, pageWidth / 2 + 80, y);
    y += 5;
    doc.setFontSize(8);
    doc.text('Partner Authorized Signatory', margin, y);
    doc.text('iWhistle, LLC Representative', pageWidth / 2 + 10, y);

    // Footer
    y += 20;
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('This agreement is subject to iWhistle\'s standard Institutional Partnership Agreement terms and conditions.', margin, y);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, y + 5);

    doc.save(`iWhistle-Partnership-Agreement-${formData.partnerOrgName || 'Draft'}.pdf`);
  };

  const handleSubmit = async () => {
    if (!validate()) {
      const firstErrorField = Object.keys(errors)[0] || Object.keys(requiredFields).find(f => !formData[f]?.toString().trim());
      if (firstErrorField) {
        document.getElementById(firstErrorField)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      // Re-validate to populate errors if validate was called before state updated
      validate();
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      const resp = await fetch(`${API_URL}/api/partnerships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!resp.ok) throw new Error('Submission failed');
      setSubmitStatus('success');
      localStorage.removeItem('iwhistlePartnershipForm');
    } catch (err) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const errorBorder = (field) => errors[field] ? 'border-red-400 focus-visible:border-red-500 focus-visible:ring-red-200' : '';

  return (
    <section id="partnership-form" data-testid="partnership-form-section" className="section-padding bg-gray-50">
      <div className="max-w-6xl mx-auto container-padding">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 bg-iwhistle-blue/10 text-iwhistle-blue rounded-full text-sm font-medium mb-4">
            PARTNERSHIP AGREEMENT
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-iwhistle-deep mb-6">
            Complete Your Partnership Agreement
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Fill out the form below with your organization details. Your progress is automatically saved
            so you can return anytime to complete your agreement.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button onClick={() => setActiveTab('form')} data-testid="tab-form"
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'form' ? 'bg-iwhistle-blue text-white' : 'text-gray-600 hover:text-iwhistle-blue'}`}>
              Fill Form
            </button>
            <button onClick={() => setActiveTab('preview')} data-testid="tab-preview"
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'preview' ? 'bg-iwhistle-blue text-white' : 'text-gray-600 hover:text-iwhistle-blue'}`}>
              Preview Agreement
            </button>
          </div>
        </ScrollReveal>

        {/* Validation summary */}
        <AnimatePresence>
          {Object.keys(errors).length > 0 && activeTab === 'form' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
              data-testid="validation-summary"
            >
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Please fix {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? 's' : ''} before submitting</p>
                <p className="text-xs text-red-600 mt-1">Required fields are marked with an asterisk (*)</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit status */}
        <AnimatePresence>
          {submitStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`max-w-4xl mx-auto mb-6 p-4 rounded-lg flex items-start gap-3 ${
                submitStatus === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}
              data-testid="submit-status"
            >
              {submitStatus === 'success' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Partnership application submitted successfully!</p>
                    <p className="text-xs text-green-600 mt-1">Our team will review your application and contact you shortly.</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Failed to submit application. Please try again.</p>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'form' ? (
          <ScrollReveal delay={0.2}>
            <Card className="shadow-lg border-iwhistle-blue/10">
              <CardHeader className="bg-gradient-to-r from-iwhistle-deep to-iwhistle-blue text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <FileText className="w-6 h-6" />
                  Partnership Agreement Form
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 lg:p-8">
                <form className="space-y-8" data-testid="partnership-agreement-form" onSubmit={(e) => e.preventDefault()}>
                  {/* Organization Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-iwhistle-deep mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-iwhistle-blue" /> Organization Information
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <FormField label="Organization Legal Name" id="partnerOrgName" error={errors.partnerOrgName}>
                          <Input id="partnerOrgName" data-testid="input-org-name" value={formData.partnerOrgName} onChange={(e) => handleChange('partnerOrgName', e.target.value)} placeholder="e.g., Youth Basketball League of Chicago" className={`mt-1 ${errorBorder('partnerOrgName')}`} />
                        </FormField>
                      </div>
                      <FormField label="Entity Type" id="partnerEntityType" error={errors.partnerEntityType}>
                        <Input id="partnerEntityType" value={formData.partnerEntityType} onChange={(e) => handleChange('partnerEntityType', e.target.value)} placeholder="e.g., Nonprofit Corporation" className={`mt-1 ${errorBorder('partnerEntityType')}`} />
                      </FormField>
                      <FormField label="Organization Type" id="orgType" error={errors.orgType}>
                        <Input id="orgType" value={formData.orgType} onChange={(e) => handleChange('orgType', e.target.value)} placeholder="e.g., Youth League, Camp/Clinic" className={`mt-1 ${errorBorder('orgType')}`} />
                      </FormField>
                      <div className="sm:col-span-2">
                        <FormField label="Street Address" id="partnerAddress" error={errors.partnerAddress}>
                          <Input id="partnerAddress" value={formData.partnerAddress} onChange={(e) => handleChange('partnerAddress', e.target.value)} placeholder="123 Main Street" className={`mt-1 ${errorBorder('partnerAddress')}`} />
                        </FormField>
                      </div>
                      <FormField label="City" id="partnerCity" error={errors.partnerCity}>
                        <Input id="partnerCity" value={formData.partnerCity} onChange={(e) => handleChange('partnerCity', e.target.value)} placeholder="Chicago" className={`mt-1 ${errorBorder('partnerCity')}`} />
                      </FormField>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField label="State" id="partnerState" error={errors.partnerState}>
                          <Input id="partnerState" value={formData.partnerState} onChange={(e) => handleChange('partnerState', e.target.value)} placeholder="IL" className={`mt-1 ${errorBorder('partnerState')}`} />
                        </FormField>
                        <FormField label="ZIP" id="partnerZip" error={errors.partnerZip}>
                          <Input id="partnerZip" value={formData.partnerZip} onChange={(e) => handleChange('partnerZip', e.target.value)} placeholder="60601" className={`mt-1 ${errorBorder('partnerZip')}`} />
                        </FormField>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Primary Contact */}
                  <div>
                    <h3 className="text-lg font-semibold text-iwhistle-deep mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-iwhistle-blue" /> Primary Contact
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField label="Full Name" id="contactName" error={errors.contactName}>
                        <Input id="contactName" data-testid="input-contact-name" value={formData.contactName} onChange={(e) => handleChange('contactName', e.target.value)} placeholder="John Smith" className={`mt-1 ${errorBorder('contactName')}`} />
                      </FormField>
                      <FormField label="Title" id="contactTitle" error={errors.contactTitle}>
                        <Input id="contactTitle" value={formData.contactTitle} onChange={(e) => handleChange('contactTitle', e.target.value)} placeholder="Executive Director" className={`mt-1 ${errorBorder('contactTitle')}`} />
                      </FormField>
                      <FormField label="Email" id="contactEmail" error={errors.contactEmail}>
                        <Input id="contactEmail" data-testid="input-contact-email" type="email" value={formData.contactEmail} onChange={(e) => handleChange('contactEmail', e.target.value)} placeholder="john@example.com" className={`mt-1 ${errorBorder('contactEmail')}`} />
                      </FormField>
                      <FormField label="Phone" id="contactPhone" error={errors.contactPhone}>
                        <Input id="contactPhone" type="tel" value={formData.contactPhone} onChange={(e) => handleChange('contactPhone', e.target.value)} placeholder="(555) 123-4567" className={`mt-1 ${errorBorder('contactPhone')}`} />
                      </FormField>
                    </div>
                  </div>

                  <Separator />

                  {/* Program Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-iwhistle-deep mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-iwhistle-blue" /> Program Details
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="mb-2 block">Term Structure <span className="text-red-500">*</span></Label>
                        <RadioGroup value={formData.termStructure} onValueChange={(value) => handleChange('termStructure', value)} className="flex gap-6">
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
                          <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => handleChange('startDate', e.target.value)} className={`mt-1 ${errorBorder('startDate')}`} />
                        </FormField>
                        <FormField label="End Date" id="endDate" error={errors.endDate}>
                          <Input id="endDate" type="date" value={formData.endDate} onChange={(e) => handleChange('endDate', e.target.value)} className={`mt-1 ${errorBorder('endDate')}`} />
                        </FormField>
                        <FormField label="Number of Officials" id="numOfficials" error={errors.numOfficials}>
                          <Input id="numOfficials" type="number" min="10" value={formData.numOfficials} onChange={(e) => handleChange('numOfficials', e.target.value)} placeholder="25" className={`mt-1 ${errorBorder('numOfficials')}`} />
                        </FormField>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Partner Champion */}
                  <div>
                    <h3 className="text-lg font-semibold text-iwhistle-deep mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-iwhistle-blue" /> Partner Champion
                      <span className="text-sm font-normal text-gray-500">(Primary Point of Contact)</span>
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField label="Full Name" id="championName" error={errors.championName}>
                        <Input id="championName" value={formData.championName} onChange={(e) => handleChange('championName', e.target.value)} placeholder="Jane Doe" className={`mt-1 ${errorBorder('championName')}`} />
                      </FormField>
                      <FormField label="Title" id="championTitle" error={errors.championTitle}>
                        <Input id="championTitle" value={formData.championTitle} onChange={(e) => handleChange('championTitle', e.target.value)} placeholder="Referee Coordinator" className={`mt-1 ${errorBorder('championTitle')}`} />
                      </FormField>
                      <FormField label="Email" id="championEmail" error={errors.championEmail}>
                        <Input id="championEmail" type="email" value={formData.championEmail} onChange={(e) => handleChange('championEmail', e.target.value)} placeholder="jane@example.com" className={`mt-1 ${errorBorder('championEmail')}`} />
                      </FormField>
                      <FormField label="Phone" id="championPhone" error={errors.championPhone}>
                        <Input id="championPhone" type="tel" value={formData.championPhone} onChange={(e) => handleChange('championPhone', e.target.value)} placeholder="(555) 987-6543" className={`mt-1 ${errorBorder('championPhone')}`} />
                      </FormField>
                    </div>
                  </div>

                  <Separator />

                  {/* Pricing */}
                  <div>
                    <h3 className="text-lg font-semibold text-iwhistle-deep mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-iwhistle-blue" /> Pricing Details
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <FormField label="Per-User Monthly Rate ($)" id="perUserRate" error={errors.perUserRate}>
                        <Input id="perUserRate" type="number" min="0" step="0.01" value={formData.perUserRate} onChange={(e) => handleChange('perUserRate', e.target.value)} placeholder="8.00" className={`mt-1 ${errorBorder('perUserRate')}`} />
                      </FormField>
                      <FormField label="Pilot Conversion Discount (%)" id="pilotDiscount" error={errors.pilotDiscount} required={false}>
                        <Input id="pilotDiscount" type="number" min="0" max="100" value={formData.pilotDiscount} onChange={(e) => handleChange('pilotDiscount', e.target.value)} placeholder="15" className={`mt-1 ${errorBorder('pilotDiscount')}`} />
                      </FormField>
                      <div className="flex items-end">
                        <div className="bg-iwhistle-blue/10 rounded-lg px-4 py-3 w-full" data-testid="estimated-total">
                          <span className="text-sm text-gray-600">Estimated Total:</span>
                          <div className="text-2xl font-bold text-iwhistle-blue">${calculateTotal()}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Authorized Signatory */}
                  <div>
                    <h3 className="text-lg font-semibold text-iwhistle-deep mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-iwhistle-blue" /> Authorized Signatory
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <FormField label="Full Name" id="signerName" error={errors.signerName}>
                        <Input id="signerName" value={formData.signerName} onChange={(e) => handleChange('signerName', e.target.value)} placeholder="Authorized Signer Name" className={`mt-1 ${errorBorder('signerName')}`} />
                      </FormField>
                      <FormField label="Title" id="signerTitle" error={errors.signerTitle}>
                        <Input id="signerTitle" value={formData.signerTitle} onChange={(e) => handleChange('signerTitle', e.target.value)} placeholder="President/CEO" className={`mt-1 ${errorBorder('signerTitle')}`} />
                      </FormField>
                      <FormField label="Date" id="signatureDate" error={errors.signatureDate}>
                        <Input id="signatureDate" type="date" value={formData.signatureDate} onChange={(e) => handleChange('signatureDate', e.target.value)} className={`mt-1 ${errorBorder('signatureDate')}`} />
                      </FormField>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <motion.div className="flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button type="button" onClick={handleSave} data-testid="save-progress-btn" className="w-full btn-primary">
                        {isSaved ? (<><CheckCircle className="w-5 h-5 mr-2" />Saved!</>) : (<><Save className="w-5 h-5 mr-2" />Save Progress</>)}
                      </Button>
                    </motion.div>
                    <motion.div className="flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button type="button" onClick={generatePDF} variant="outline" data-testid="download-pdf-btn" className="w-full btn-secondary">
                        <Download className="w-5 h-5 mr-2" />Download PDF
                      </Button>
                    </motion.div>
                    <motion.div className="flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button type="button" onClick={handleSubmit} disabled={isSubmitting} data-testid="submit-application-btn"
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-semibold transition-all duration-200 bg-green-600 hover:bg-green-700 disabled:opacity-50">
                        {isSubmitting ? (
                          <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</>
                        ) : (
                          <><Send className="w-5 h-5" />Submit Application</>
                        )}
                      </Button>
                    </motion.div>
                  </div>

                  <p className="text-sm text-gray-500 text-center">
                    Your progress is saved to your browser. Submit when ready for our team to review.
                  </p>
                </form>
              </CardContent>
            </Card>
          </ScrollReveal>
        ) : (
          <ScrollReveal delay={0.2}>
            <Card className="shadow-lg border-iwhistle-blue/10">
              <CardHeader className="bg-gradient-to-r from-iwhistle-deep to-iwhistle-blue text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <FileText className="w-6 h-6" /> Agreement Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 lg:p-8">
                <div className="bg-gray-50 rounded-lg p-6 font-mono text-sm whitespace-pre-wrap text-gray-700 max-h-[600px] overflow-y-auto" data-testid="agreement-preview">
                  {generateAgreementText()}
                </div>
                <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                  <motion.button onClick={generatePDF} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="btn-primary inline-flex items-center gap-2" data-testid="download-full-pdf-btn">
                    <Download className="w-5 h-5" />Download PDF
                  </motion.button>
                  <motion.button onClick={handleSubmit} disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-semibold transition-all bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    data-testid="submit-from-preview-btn">
                    <Send className="w-5 h-5" />{isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </motion.button>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
