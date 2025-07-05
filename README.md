# Invoice Generator App

A modern, client-side invoice generating application built with React, Vite, TypeScript, and Tailwind CSS. It allows users to create, manage, and export invoices directly in their browser. All data is stored locally using IndexedDB, ensuring privacy and offline access. The application is also a Progressive Web App (PWA), allowing for installation on your device.

## Features

*   **Create Invoices:** Easily generate professional invoices with details like invoice number, dates, line items, quantities, prices, and tax.
*   **Manage Invoices:** View a list of all created invoices, with statuses and key details.
*   **Invoice Preview:** Preview invoices before saving or exporting.
*   **Export to PDF:** Download invoices as PDF documents (utilizing `jspdf` and `html2canvas`).
*   **Dashboard:** View a summary of invoice statuses (e.g., paid, pending, overdue).
*   **Local Data Storage:** All invoice data is stored in your browser's IndexedDB via Dexie.js. Your data stays on your machine.
*   **Data Backup & Restore:**
    *   **Manual Backup:** Users can download a JSON file containing all their invoice data.
    *   **Manual Restore:** Users can upload a previously downloaded JSON backup file to restore their data. This is useful for transferring data between browsers or computers.
*   **Progressive Web App (PWA):**
    *   **Installable:** Can be installed on desktop and mobile devices for an app-like experience.
    *   **Potential Browser Sync:** If you use a browser that supports data synchronization (e.g., Chrome with a Google account, Edge with a Microsoft account) and have it enabled, your invoice data *may* be synced across your devices. However, for guaranteed backup and transfer, the manual backup/restore feature is recommended.
*   **Responsive Design:** Styled with Tailwind CSS for a clean and responsive user interface.

## Tech Stack

*   **Frontend Library:** React 18
*   **Build Tool:** Vite
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **UI Components:** `@heroui/react`
*   **Client-side Database:** IndexedDB (via Dexie.js)
*   **PDF Generation:** jsPDF, html2canvas
*   **PWA:** `vite-plugin-pwa` (Workbox)
*   **Routing:** Tab-based navigation within `App.tsx` (no external router library)
*   **Unique ID Generation:** UUID

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v18.x or later recommended)
*   Yarn (v1.x - project is configured to use Yarn)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd invoice-app
    ```

2.  **Install dependencies:**
    This project uses Yarn as its package manager.
    ```bash
    yarn install
    ```
    *(If you see a warning about `package-lock.json`, it can be safely ignored or deleted as this project standardizes on `yarn.lock`.)*

### Running the Development Server

To start the Vite development server:
```bash
yarn dev
```
This will typically open the application in your default web browser at `http://localhost:5173` (or another port if 5173 is in use). The server supports Hot Module Replacement (HMR).

### Building for Production

To create a production build:
```bash
yarn build
```
This command will generate optimized static assets in the `dist` folder.

### Previewing the Production Build

After building, you can preview the production application locally:
```bash
yarn preview
```
This will serve the contents of the `dist` folder.

## PWA Notes

*   **Icons:** For the PWA to be fully functional and display correctly when installed, ensure the following icon files are present in the `public/` directory:
    *   `vite.svg` (already included)
    *   `pwa-192x192.png` (192x192 pixels)
    *   `pwa-512x512.png` (512x512 pixels - also used for the maskable icon)
    You may need to create these PNG icons if they are not already present.
*   **Testing PWA Features:** Use browser developer tools (e.g., Chrome DevTools > Application tab) to inspect the manifest, service worker, and test installability.

## Data Management

*   **Storage:** All your invoice data is stored locally in your browser's IndexedDB. It is not sent to any server.
*   **Backup:** Navigate to `Settings > Data Management` to download a backup of all your data as a JSON file (`invoices-backup.json`). It is highly recommended to save this file in a secure location, such as your personal cloud storage (Google Drive, Dropbox, etc.).
*   **Restore:** From the same settings section, you can upload a previously downloaded `invoices-backup.json` file to restore your data. This will overwrite any existing data in the application.
*   **Browser Sync:** As mentioned in the features, your browser *may* sync this application's data if you have sync enabled. However, rely on the manual backup feature for guaranteed data safety and transfer.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

1.  **Fork the repository.**
2.  **Create a new branch for your feature or bug fix:**
    ```bash
    git checkout -b feature/your-feature-name
    ```
    or
    ```bash
    git checkout -b fix/your-bug-fix-name
    ```
3.  **Make your changes.**
    *   Ensure your code follows the existing style and conventions.
    *   If adding new features, consider if any tests are needed (note: current project structure does not have extensive automated tests).
    *   Update the README.md if your changes affect setup, features, or configuration.
4.  **Commit your changes with a clear and descriptive commit message:**
    Follow conventional commit message formats if possible (e.g., `feat: Add X feature`, `fix: Resolve Y bug`).
5.  **Push your changes to your forked repository:**
    ```bash
    git push origin feature/your-feature-name
    ```
6.  **Open a Pull Request (PR)** against the `main` branch of the original repository.
    *   Provide a clear title and description for your PR, explaining the changes and why they are being made.
    *   Link any relevant issues.

### Code Style

*   This project uses ESLint for linting (configuration can be found in `eslint.config.js` or similar). Please ensure your code adheres to the linting rules.
*   Formatting is generally handled by Prettier or similar tools, often integrated with ESLint.

### Areas for Future Improvement / Contribution Ideas

*   More robust PDF export customization options.
*   Automated end-to-end tests (e.g., using Playwright or Cypress).
*   Unit tests for key components and utility functions.
*   Internationalization (i18n) support.
*   More detailed dashboard analytics.
*   Theming options.
*   Direct integration with a cloud storage provider for backups (this is complex due to OAuth and client-side limitations but could be explored).

## License

This project is intended to be open source. Please add a `LICENSE` file with your chosen open-source license (e.g., MIT, Apache 2.0). For now, consider it under a placeholder license allowing use and modification.

---

*This README was generated/updated by an AI assistant.*
