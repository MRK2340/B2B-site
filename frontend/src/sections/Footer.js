import React from 'react';

const quickLinks = [
  { label: 'Home', href: '#' },
  { label: 'Partnership', href: '#partnership' },
  { label: 'Pilot Program', href: '#pilot' },
  { label: 'Documents', href: '#documents' },
];

const resourceLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Data Processing Agreements', href: '#' },
];

export function Footer() {
  return (
    <footer data-testid="footer" className="bg-iwhistle-deep text-white">
      <div className="max-w-7xl mx-auto container-padding py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-4" data-testid="footer-logo">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">i</span>
              </div>
              <span className="font-bold text-xl text-white">Whistle</span>
            </a>
            <p className="text-iwhistle-light text-sm mb-4">Leadership Under Pressure</p>
            <p className="text-white/60 text-sm leading-relaxed">
              Elevating basketball officiating through AI-powered education,
              video training, and mental wellness programming.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-white/70 hover:text-iwhistle-orange transition-colors duration-200 text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-white/70 hover:text-iwhistle-orange transition-colors duration-200 text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:partnerships@iwhistle.com" className="text-white/70 hover:text-iwhistle-orange transition-colors duration-200 text-sm">
                  partnerships@iwhistle.com
                </a>
              </li>
              <li>
                <a href="mailto:legal@iwhistle.com" className="text-white/70 hover:text-iwhistle-orange transition-colors duration-200 text-sm">
                  legal@iwhistle.com
                </a>
              </li>
              <li>
                <a href="https://www.iwhistle.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-iwhistle-orange transition-colors duration-200 text-sm">
                  www.iwhistle.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto container-padding py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-sm">&copy; 2026 iWhistle, LLC. All rights reserved.</p>
            <p className="text-white/30 text-sm">Leadership Under Pressure</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
