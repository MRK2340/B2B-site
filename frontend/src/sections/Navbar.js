import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { useScrollPosition } from '../hooks/useScrollPosition';
import { Sheet, SheetTrigger, SheetContent } from '../components/ui/sheet';

const navLinks = [
  { label: 'Partnership', href: '#partnership' },
  { label: 'Pilot Program', href: '#pilot' },
  { label: 'Documents', href: '#documents' },
  { label: 'Apply', href: '#partnership-form' },
  { label: 'Contact', href: '#contact' },
];

export function Navbar() {
  const { isScrolled } = useScrollPosition();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.header
      data-testid="navbar"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-4">
          <a href="#" className="flex items-center gap-2 group" data-testid="navbar-logo">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">i</span>
            </div>
            <span className={`font-bold text-xl transition-colors duration-200 ${
              isScrolled ? 'text-iwhistle-deep' : 'text-white'
            }`}>
              Whistle
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                data-testid={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`text-sm font-medium transition-colors duration-200 hover:text-iwhistle-blue ${
                  isScrolled ? 'text-iwhistle-deep' : 'text-white/90'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:block">
            <a href="#contact" className="btn-primary text-sm" data-testid="navbar-cta">
              Get Started
            </a>
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <button
                data-testid="mobile-menu-button"
                className={`p-2 rounded-lg transition-colors ${
                  isScrolled ? 'text-iwhistle-deep' : 'text-white'
                }`}
              >
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-white">
              <div className="flex flex-col gap-6 mt-8">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium text-iwhistle-deep hover:text-iwhistle-blue transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href="#contact"
                  onClick={() => setIsOpen(false)}
                  className="btn-primary text-center mt-4"
                >
                  Get Started
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  );
}
