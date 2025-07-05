import React, { useRef } from 'react'; // Added useRef
import { db } from '../db/db'; // Import the Dexie db instance
import { Invoice } from '../types/invoice'; // Import Invoice type for casting
// We might use Button from '@heroui/react' if available and suitable
// import { Button } from '@heroui/react';

const SettingsPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input

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
