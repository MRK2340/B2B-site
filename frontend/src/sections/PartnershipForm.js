import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Download, CheckCircle, Building2, Users, Calendar, User, FileText } from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Separator } from '../components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const initialFormData = {
  partnerOrgName: '', partnerEntityType: '', partnerState: '', partnerAddress: '',
  partnerCity: '', partnerZip: '', contactName: '', contactTitle: '', contactEmail: '',
  contactPhone: '', termStructure: 'annual', startDate: '', endDate: '', numOfficials: '',
  orgType: '', championName: '', championTitle: '', championEmail: '', championPhone: '',
  signerName: '', signerTitle: '', signatureDate: new Date().toISOString().split('T')[0],
  perUserRate: '', pilotDiscount: '',
};

export function PartnershipForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('form');

  useEffect(() => {
    const saved = localStorage.getItem('iwhistlePartnershipForm');
    if (saved) {
      try { setFormData(prev => ({ ...prev, ...JSON.parse(saved) })); }
      catch (e) { console.error('Failed to load saved form data'); }
    }
  }, []);

  const handleChange = (field, value) => { setFormData(prev => ({ ...prev, [field]: value })); setIsSaved(false); };
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

  const handleDownload = () => {
    const text = generateAgreementText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iWhistle-Partnership-Agreement-${formData.partnerOrgName || 'Draft'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
            <button
              onClick={() => setActiveTab('form')}
              data-testid="tab-form"
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'form' ? 'bg-iwhistle-blue text-white' : 'text-gray-600 hover:text-iwhistle-blue'
              }`}
            >
              Fill Form
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              data-testid="tab-preview"
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'preview' ? 'bg-iwhistle-blue text-white' : 'text-gray-600 hover:text-iwhistle-blue'
              }`}
            >
              Preview Agreement
            </button>
          </div>
        </ScrollReveal>

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
                <form className="space-y-8" data-testid="partnership-agreement-form">
                  {/* Organization Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-iwhistle-deep mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-iwhistle-blue" /> Organization Information
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <Label htmlFor="partnerOrgName">Organization Legal Name *</Label>
                        <Input id="partnerOrgName" data-testid="input-org-name" value={formData.partnerOrgName} onChange={(e) => handleChange('partnerOrgName', e.target.value)} placeholder="e.g., Youth Basketball League of Chicago" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="partnerEntityType">Entity Type *</Label>
                        <Input id="partnerEntityType" value={formData.partnerEntityType} onChange={(e) => handleChange('partnerEntityType', e.target.value)} placeholder="e.g., Nonprofit Corporation" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="orgType">Organization Type *</Label>
                        <Input id="orgType" value={formData.orgType} onChange={(e) => handleChange('orgType', e.target.value)} placeholder="e.g., Youth League, Camp/Clinic" className="mt-1" />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="partnerAddress">Street Address *</Label>
                        <Input id="partnerAddress" value={formData.partnerAddress} onChange={(e) => handleChange('partnerAddress', e.target.value)} placeholder="123 Main Street" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="partnerCity">City *</Label>
                        <Input id="partnerCity" value={formData.partnerCity} onChange={(e) => handleChange('partnerCity', e.target.value)} placeholder="Chicago" className="mt-1" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="partnerState">State *</Label>
                          <Input id="partnerState" value={formData.partnerState} onChange={(e) => handleChange('partnerState', e.target.value)} placeholder="IL" className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="partnerZip">ZIP *</Label>
                          <Input id="partnerZip" value={formData.partnerZip} onChange={(e) => handleChange('partnerZip', e.target.value)} placeholder="60601" className="mt-1" />
                        </div>
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
                      <div>
                        <Label htmlFor="contactName">Full Name *</Label>
                        <Input id="contactName" data-testid="input-contact-name" value={formData.contactName} onChange={(e) => handleChange('contactName', e.target.value)} placeholder="John Smith" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="contactTitle">Title *</Label>
                        <Input id="contactTitle" value={formData.contactTitle} onChange={(e) => handleChange('contactTitle', e.target.value)} placeholder="Executive Director" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="contactEmail">Email *</Label>
                        <Input id="contactEmail" data-testid="input-contact-email" type="email" value={formData.contactEmail} onChange={(e) => handleChange('contactEmail', e.target.value)} placeholder="john@example.com" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="contactPhone">Phone *</Label>
                        <Input id="contactPhone" type="tel" value={formData.contactPhone} onChange={(e) => handleChange('contactPhone', e.target.value)} placeholder="(555) 123-4567" className="mt-1" />
                      </div>
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
                        <Label className="mb-2 block">Term Structure *</Label>
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
                        <div>
                          <Label htmlFor="startDate">Start Date *</Label>
                          <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => handleChange('startDate', e.target.value)} className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="endDate">End Date *</Label>
                          <Input id="endDate" type="date" value={formData.endDate} onChange={(e) => handleChange('endDate', e.target.value)} className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="numOfficials">Number of Officials *</Label>
                          <Input id="numOfficials" type="number" min="10" value={formData.numOfficials} onChange={(e) => handleChange('numOfficials', e.target.value)} placeholder="25" className="mt-1" />
                        </div>
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
                      <div><Label htmlFor="championName">Full Name *</Label><Input id="championName" value={formData.championName} onChange={(e) => handleChange('championName', e.target.value)} placeholder="Jane Doe" className="mt-1" /></div>
                      <div><Label htmlFor="championTitle">Title *</Label><Input id="championTitle" value={formData.championTitle} onChange={(e) => handleChange('championTitle', e.target.value)} placeholder="Referee Coordinator" className="mt-1" /></div>
                      <div><Label htmlFor="championEmail">Email *</Label><Input id="championEmail" type="email" value={formData.championEmail} onChange={(e) => handleChange('championEmail', e.target.value)} placeholder="jane@example.com" className="mt-1" /></div>
                      <div><Label htmlFor="championPhone">Phone *</Label><Input id="championPhone" type="tel" value={formData.championPhone} onChange={(e) => handleChange('championPhone', e.target.value)} placeholder="(555) 987-6543" className="mt-1" /></div>
                    </div>
                  </div>

                  <Separator />

                  {/* Pricing */}
                  <div>
                    <h3 className="text-lg font-semibold text-iwhistle-deep mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-iwhistle-blue" /> Pricing Details
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div><Label htmlFor="perUserRate">Per-User Monthly Rate ($) *</Label><Input id="perUserRate" type="number" min="0" step="0.01" value={formData.perUserRate} onChange={(e) => handleChange('perUserRate', e.target.value)} placeholder="8.00" className="mt-1" /></div>
                      <div><Label htmlFor="pilotDiscount">Pilot Conversion Discount (%)</Label><Input id="pilotDiscount" type="number" min="0" max="100" value={formData.pilotDiscount} onChange={(e) => handleChange('pilotDiscount', e.target.value)} placeholder="15" className="mt-1" /></div>
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
                      <div><Label htmlFor="signerName">Full Name *</Label><Input id="signerName" value={formData.signerName} onChange={(e) => handleChange('signerName', e.target.value)} placeholder="Authorized Signer Name" className="mt-1" /></div>
                      <div><Label htmlFor="signerTitle">Title *</Label><Input id="signerTitle" value={formData.signerTitle} onChange={(e) => handleChange('signerTitle', e.target.value)} placeholder="President/CEO" className="mt-1" /></div>
                      <div><Label htmlFor="signatureDate">Date *</Label><Input id="signatureDate" type="date" value={formData.signatureDate} onChange={(e) => handleChange('signatureDate', e.target.value)} className="mt-1" /></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <motion.div className="flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button type="button" onClick={handleSave} data-testid="save-progress-btn" className="w-full btn-primary">
                        {isSaved ? (<><CheckCircle className="w-5 h-5 mr-2" />Saved Successfully!</>) : (<><Save className="w-5 h-5 mr-2" />Save Progress</>)}
                      </Button>
                    </motion.div>
                    <motion.div className="flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button type="button" onClick={handleDownload} variant="outline" data-testid="download-draft-btn" className="w-full btn-secondary">
                        <Download className="w-5 h-5 mr-2" />Download Draft
                      </Button>
                    </motion.div>
                  </div>

                  <p className="text-sm text-gray-500 text-center">
                    Your progress is automatically saved to your browser. You can return anytime to complete this form.
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
                <div className="mt-6 flex justify-center">
                  <motion.button
                    onClick={handleDownload}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary inline-flex items-center gap-2"
                    data-testid="download-full-agreement-btn"
                  >
                    <Download className="w-5 h-5" />
                    Download Full Agreement
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
