// כתובת ה-Web App של Google Apps Script (ראה README להוראות פריסה)
export const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL
  || 'https://script.google.com/macros/s/AKfycbxDmMMU5Z5YI0tBQ-fi9LFvVMxTah_dQ1iL1EL-4Xp3f6SVISpFTRa_LDXaxomXOdmfTg/exec'

// רשימת האתרים הפעילים - עדכן כאן כשנפתח/נסגר אתר
export const SITES = [
  'קריית גת - רב תכליתי',
  'ת״א אוניברסיטה',
  'ירושלים- נווה יעקב',
  'ירושלים- עמק הצבאים',
  'ירושלים- תחמ״ש נחל צופים',
  'בית שמש',
  'בת ים- תחמ״ש',
  'גן רווה - תחמ״ש',
  'אחיסמך- מקווה',
  'קריית מלאכי- מקווה',
  'בית הגדי- תחמ״ש',
  'מחסן - הגעת ברנר',
  'כללי- עבודה יומית',
]

// רשימת חברות קבלן קבועות - מנהל העבודה יכול גם להקליד חברה שלא ברשימה
export const CONTRACTOR_COMPANIES = [
  'רם',
  'ארגמן',
  'דנאל',
  'אמפליאדוס',
  'גל',
  'עשייה',
  'אקסטרא',
]
