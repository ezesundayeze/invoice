import { InvoiceBranding } from '../types/invoice';

export interface BusinessProfile {
  name: string;
  email: string;
  address: string;
  phone: string;
}

const STORAGE_KEY = 'invoice-business-profile';
const BRANDING_KEY = 'invoice-branding';

export const DEFAULT_ACCENT_COLOR = '#338ef7';

export const emptyBranding = (): InvoiceBranding => ({
  logo: '',
  accentColor: DEFAULT_ACCENT_COLOR,
});

export const getBranding = (): InvoiceBranding => {
  try {
    const raw = localStorage.getItem(BRANDING_KEY);
    if (!raw) return emptyBranding();
    return { ...emptyBranding(), ...JSON.parse(raw) };
  } catch {
    return emptyBranding();
  }
};

export const saveBranding = (branding: InvoiceBranding): void => {
  try {
    localStorage.setItem(BRANDING_KEY, JSON.stringify(branding));
  } catch {
    // Ignore storage errors (e.g. private mode or quota for large logos).
  }
};

export const emptyProfile = (): BusinessProfile => ({
  name: '',
  email: '',
  address: '',
  phone: '',
});

export const getProfile = (): BusinessProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProfile();
    return { ...emptyProfile(), ...JSON.parse(raw) };
  } catch {
    return emptyProfile();
  }
};

export const saveProfile = (profile: BusinessProfile): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage errors (e.g. private mode); profile just won't persist.
  }
};
