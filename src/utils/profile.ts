export interface BusinessProfile {
  name: string;
  email: string;
  address: string;
  phone: string;
}

const STORAGE_KEY = 'invoice-business-profile';

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
