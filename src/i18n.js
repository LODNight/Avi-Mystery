import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import navEn from './locales/en/nav.json';
import navVi from './locales/vi/nav.json';
import investigationEn from './locales/en/investigation.json';
import investigationVi from './locales/vi/investigation.json';
import commonEn from './locales/en/common.json';
import commonVi from './locales/vi/common.json';
import workbenchEn from './locales/en/workbench.json';
import workbenchVi from './locales/vi/workbench.json';
import settingsEn from './locales/en/settings.json';
import settingsVi from './locales/vi/settings.json';
import dashboardEn from './locales/en/dashboard.json';
import dashboardVi from './locales/vi/dashboard.json';
import mapEn from './locales/en/map.json';
import mapVi from './locales/vi/map.json';
import practiceEn from './locales/en/practice.json';
import practiceVi from './locales/vi/practice.json';
import achievementsEn from './locales/en/achievements.json';
import achievementsVi from './locales/vi/achievements.json';
import profileEn from './locales/en/profile.json';
import profileVi from './locales/vi/profile.json';

const resources = {
  en: {
    nav: navEn,
    investigation: investigationEn,
    common: commonEn,
    workbench: workbenchEn,
    settings: settingsEn,
    dashboard: dashboardEn,
    map: mapEn,
    practice: practiceEn,
    achievements: achievementsEn,
    profile: profileEn,
  },
  vi: {
    nav: navVi,
    investigation: investigationVi,
    common: commonVi,
    workbench: workbenchVi,
    settings: settingsVi,
    dashboard: dashboardVi,
    map: mapVi,
    practice: practiceVi,
    achievements: achievementsVi,
    profile: profileVi,
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi',
    supportedLngs: ['vi', 'en'],
    load: 'languageOnly',
    cleanCode: true,
    debug: false,
    ns: ['nav', 'investigation', 'common', 'workbench', 'settings', 'dashboard', 'map', 'practice', 'achievements', 'profile'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    saveMissing: import.meta.env?.DEV === true,
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      if (import.meta.env?.DEV === true) {
        console.warn(`[i18next] Missing translation key: "${key}" in namespace "${ns}" for language "${lng}".`);
      }
    }
  });

export default i18n;
