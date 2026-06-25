import React, { useRef, useState } from 'react'; // Added useRef, useState
import { db } from '../db/db'; // Import the Dexie db instance
import { Invoice } from '../types/invoice'; // Import Invoice type for casting
import {
  BusinessProfile,
  DEFAULT_ACCENT_COLOR,
  getBranding,
  getProfile,
  saveBranding,
  saveProfile,
} from '../utils/profile';
import { InvoiceBranding } from '../types/invoice';
import {
  CURRENCIES,
  CurrencySettings,
  getCurrencySettings,
  saveCurrencySettings,
} from '../utils/currency';
// We might use Button from '@heroui/react' if available and suitable
// import { Button } from '@heroui/react';

// Draw an uploaded image (including SVG) onto a canvas and export it as a
// downscaled PNG data URL. Rasterizing here keeps the stored logo small and
// renders reliably in the exported PDF.
const rasterizeToPng = (dataUrl: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const maxH = 200;
      const maxW = 600;
      let w = img.naturalWidth || 300;
      let h = img.naturalHeight || 150;
      const scale = Math.min(1, maxH / h, maxW / w);
      w = Math.max(1, Math.round(w * scale));
      h = Math.max(1, Math.round(h * scale));

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas is not supported'));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });

const SettingsPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input
  const logoInputRef = useRef<HTMLInputElement>(null); // Ref for logo file input
  const [profile, setProfile] = useState<BusinessProfile>(() => getProfile());
  const [branding, setBranding] = useState<InvoiceBranding>(() => getBranding());

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile(profile);
    alert('Business profile saved. It will pre-fill the "Your Details" section on new invoices.');
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file for your logo.');
      return;
    }
    // Keep logos small since they are stored (base64) in localStorage.
    if (file.size > 500 * 1024) {
      alert('Please choose a logo smaller than 500KB.');
      if (logoInputRef.current) logoInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        // Normalize to a downscaled PNG. This guarantees a defined size and
        // avoids html2canvas's unreliable SVG handling when exporting the PDF.
        const png = await rasterizeToPng(dataUrl);
        setBranding((prev) => ({ ...prev, logo: png }));
      } catch {
        // If rasterization fails, fall back to the original upload.
        setBranding((prev) => ({ ...prev, logo: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setBranding((prev) => ({ ...prev, logo: '' }));
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    saveBranding(branding);
    alert('Branding saved. New invoices will use your logo and accent color.');
  };

  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>(
    () => getCurrencySettings()
  );

  const handleDefaultCurrencyChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setCurrencySettings((prev) => ({ ...prev, defaultCurrency: value }));
  };

  const handleRateChange = (code: string, value: string) => {
    setCurrencySettings((prev) => ({
      ...prev,
      rates: { ...prev.rates, [code]: parseFloat(value) || 0 },
    }));
  };

  const handleSaveCurrencySettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveCurrencySettings(currencySettings);
    alert('Currency settings saved. Dashboard totals now use these rates and default currency.');
  };

  const handleBackup = async () => {
    try {
      const allInvoices = await db.invoices.toArray();
      if (allInvoices.length === 0) {
        alert('There is no data to backup.');
        return;
      }
      const jsonData = JSON.stringify(allInvoices, null, 2); // Pretty print JSON
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'invoices-backup.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('Backup successful');
      alert('Backup successful! Check your downloads for invoices-backup.json.');
    } catch (error) {
      console.error('Backup failed:', error);
      alert('Backup failed. See console for details.');
    }
  };

  const triggerRestoreInput = () => {
    fileInputRef.current?.click();
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      alert('No file selected.');
      return;
    }

    const confirmation = window.confirm(
      'Are you sure you want to restore data? This will overwrite all current invoices. It is recommended to backup your current data first.'
    );

    if (!confirmation) {
      // Reset file input value so the same file can be selected again if needed
      if(fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonText = e.target?.result as string;
        const importedInvoices = JSON.parse(jsonText) as Invoice[]; // Assuming structure matches Invoice[]

        // Basic validation: check if it's an array
        if (!Array.isArray(importedInvoices)) {
          throw new Error('Invalid file format: Expected an array of invoices.');
        }
        // Optional: Add more specific validation for invoice objects if needed

        await db.transaction('rw', db.invoices, async () => {
          await db.invoices.clear();
          await db.invoices.bulkAdd(importedInvoices);
        });
        console.log('Restore successful');
        alert('Data restored successfully!');
      } catch (error: any) {
        console.error('Restore failed:', error);
        alert(`Restore failed: ${error.message || 'Unknown error. Check console for details.'}`);
      } finally {
        // Reset file input value so the same file can be selected again
        if(fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      console.error('Failed to read file:', reader.error);
      alert('Failed to read the selected file.');
      if(fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-medium mb-2">Business Profile</h2>
          <p className="text-sm text-gray-600 mb-3">
            Your details below are used to pre-fill the "Your Details" section when you
            create a new invoice. You can still edit them on any individual invoice.
          </p>
          <form onSubmit={handleSaveProfile} className="space-y-3 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                name="address"
                value={profile.address}
                onChange={handleProfileChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Save Profile
            </button>
          </form>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-medium mb-2">Branding</h2>
          <p className="text-sm text-gray-600 mb-3">
            Add your logo and an accent color. New invoices will use them on the
            preview and exported PDF.
          </p>
          <form onSubmit={handleSaveBranding} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
              <div className="flex items-center gap-4">
                {branding.logo ? (
                  <img
                    src={branding.logo}
                    alt="Logo preview"
                    className="h-16 w-16 object-contain border border-gray-200 rounded-md bg-white"
                  />
                ) : (
                  <div className="h-16 w-16 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs text-gray-400 text-center">
                    No logo
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="px-3 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                  >
                    {branding.logo ? 'Change Logo' : 'Upload Logo'}
                  </button>
                  {branding.logo && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="px-3 py-2 text-red-600 rounded-md hover:bg-red-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={logoInputRef}
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG or SVG. Max 500KB.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={branding.accentColor || DEFAULT_ACCENT_COLOR}
                  onChange={(e) =>
                    setBranding((prev) => ({ ...prev, accentColor: e.target.value }))
                  }
                  className="h-10 w-14 border border-gray-300 rounded-md cursor-pointer bg-white"
                />
                <input
                  type="text"
                  value={branding.accentColor || ''}
                  onChange={(e) =>
                    setBranding((prev) => ({ ...prev, accentColor: e.target.value }))
                  }
                  placeholder={DEFAULT_ACCENT_COLOR}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Save Branding
            </button>
          </form>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-medium mb-2">Currency &amp; Exchange Rates</h2>
          <p className="text-sm text-gray-600 mb-3">
            Pick the default currency for new invoices and the dashboard. Dashboard
            totals combine invoices in different currencies by converting them with
            the rates below. Each rate is the value of <strong>1 unit</strong> of that
            currency in USD (e.g. 1 EUR = 1.08 USD). Update them whenever rates change.
          </p>
          <form onSubmit={handleSaveCurrencySettings} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Currency
              </label>
              <select
                value={currencySettings.defaultCurrency}
                onChange={handleDefaultCurrencyChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exchange Rates (value of 1 unit in USD)
              </label>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {CURRENCIES.map((currency) => (
                  <div key={currency.code} className="flex items-center gap-3">
                    <span className="w-40 text-sm text-gray-700">
                      {currency.code} - {currency.name}
                    </span>
                    <span className="text-sm text-gray-500">1 {currency.code} =</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={currencySettings.rates[currency.code] ?? ''}
                      onChange={(e) => handleRateChange(currency.code, e.target.value)}
                      disabled={currency.code === 'USD'}
                      className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                    />
                    <span className="text-sm text-gray-500">USD</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Save Currency Settings
            </button>
          </form>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-medium mb-2">Data Management</h2>
          <p className="text-sm text-gray-600 mb-3">
            Backup your invoice data to a local file or restore it from a previously saved backup.
            For added security, we recommend uploading your downloaded backup file to your personal cloud storage (e.g., Google Drive, Dropbox, OneDrive).
          </p>
          <div className="flex space-x-3">
            <button
              onClick={handleBackup}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Backup Data
            </button>
            <button
              onClick={triggerRestoreInput}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              Restore Data
            </button>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleRestore}
              className="hidden"
              id="restore-file-input"
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-medium mb-2">Browser Sync & Data Accessibility</h2>
          <p className="text-sm text-gray-600 mb-2">
            Modern web browsers (like Chrome, Edge, Firefox) may offer features to synchronize your application data
            if you are logged into your browser profile (e.g., with a Google or Microsoft account) and have data sync enabled.
            This could potentially make your invoice data accessible on other devices where you use the same browser and profile.
          </p>
          <p className="text-sm text-gray-600 font-medium">
            <strong>Important:</strong> While browser sync can be convenient, it is a feature controlled by your browser settings
            and not directly by this application. For guaranteed backup, data transfer between different computers or browsers,
            or recovery after clearing browser data, please use the "Backup Data" and "Restore Data" features provided above.
          </p>
        </div>
        {/* Future settings can be added here */}
      </div>
    </div>
  );
};

export default SettingsPage;
