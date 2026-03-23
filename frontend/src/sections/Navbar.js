import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, LogOut, User, ShieldCheck, Moon, Sun } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useScrollPosition } from '../hooks/useScrollPosition';
import { Sheet, SheetTrigger, SheetContent } from '../components/ui/sheet';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

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
  const { user, logout } = useAuth();
  const { isDark, toggle: toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const ThemeToggle = ({ compact = false }) => (
    <button
      onClick={toggleTheme}
      data-testid="theme-toggle-btn"
      aria-label="Toggle dark mode"
      className={`flex items-center gap-1.5 rounded-lg transition-all ${
        compact
          ? 'p-2 text-gray-500 hover:text-iwhistle-blue hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700'
          : isScrolled
          ? 'px-3 py-1.5 text-gray-500 hover:text-iwhistle-blue hover:bg-gray-100'
          : 'px-3 py-1.5 text-white/80 hover:text-white hover:bg-white/10'
      }`}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      {!compact && <span className="text-sm font-medium hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>}
    </button>
  );

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

          {/* Auth section */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {user && (
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 text-sm ${isScrolled ? 'text-iwhistle-deep' : 'text-white/90'}`} data-testid="navbar-user-info">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{user.name}</span>
                </div>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    data-testid="navbar-admin-link"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      isScrolled
                        ? 'bg-iwhistle-blue/10 text-iwhistle-blue hover:bg-iwhistle-blue/20'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  data-testid="navbar-logout-btn"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isScrolled
                      ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
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
            <SheetContent side="right" className="w-[280px] bg-white dark:bg-slate-800">
              <div className="flex flex-col gap-6 mt-8">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium text-iwhistle-deep dark:text-white hover:text-iwhistle-blue transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Theme</span>
                    <ThemeToggle compact />
                  </div>
                  {user && (
                    <>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Signed in as <span className="font-medium text-iwhistle-deep dark:text-white">{user.name}</span></p>
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-iwhistle-blue font-medium mb-3">
                          <ShieldCheck className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      <button onClick={() => { handleLogout(); setIsOpen(false); }} className="flex items-center gap-2 text-red-500 font-medium">
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  );
}
