import React from 'react';
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher({ className = '' }) {
  const { i18n } = useTranslation();
  const isES = i18n.language?.startsWith('es');

  return (
    <button
      onClick={() => i18n.changeLanguage(isES ? 'en' : 'es')}
      data-testid="lang-switcher-btn"
      aria-label="Toggle language"
      className={`text-xs font-bold px-2.5 py-1.5 rounded-full border-2 transition-all ${
        isES
          ? 'bg-iwhistle-blue text-white border-iwhistle-blue'
          : 'bg-transparent text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-iwhistle-blue hover:text-iwhistle-blue'
      } ${className}`}
    >
      {isES ? 'EN' : 'ES'}
    </button>
  );
}
