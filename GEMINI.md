# Gestione Turni (Instructional Context)

This file serves as the main architectural blueprint, developer guide, and contextual handbook for CLI agents and developers interacting with this repository.

---

## 📖 Project Overview
**Gestione Turni** is a mobile-first, standalone Progressive Web App (PWA) designed for workers to manage and track work shifts. The app calculates estimated monthly/annual gross and net earnings under the Level D1 CCNL contract, classifies shift types automatically, exports reminders via `.ics` calendar files, and operates fully offline.

### 🛠️ Technology Stack & Dependencies
- **Core**: Vanilla HTML5, CSS3, and JavaScript (ES6+).
- **Styling**: Tailwind CSS imported via CDN (`https://cdn.tailwindcss.com`) with a custom brand palette config.
- **Icons**: Lucide Icons loaded via CDN (`https://unpkg.com/lucide@latest`).
- **Offline / PWA**: Native Service Worker (`sw.js`) caching application shells and assets.
- **Responsive Layout**: Tailored for iOS/Android standalone mode (includes Apple mobile status bar config, touch highlight optimizations, and safe-area padding).

---

## 🗄️ Storage & Data Schemas

The application uses two local browser storage APIs: **IndexedDB** for structured shifts and **LocalStorage** for user preferences.

### 1. IndexedDB (`Turni DB` - Version 1)
Stores individual work shifts in the `turns` object store.
```typescript
interface Turn {
  id: string;          // Primary key, formatted as "id_<timestamp>"
  date: string;        // Date in "YYYY-MM-DD" format
  start: string;       // Start time in "HH:MM" format
  end: string;         // End time in "HH:MM" format
  colleagues?: string; // Optional, comma-separated names (e.g. "Chiara, Marta")
  notes?: string;      // Optional text notes
}
```

### 2. LocalStorage (`contractSettings` Key)
Persists the hourly rates and calculation parameters based on the Level D1 contract.
```typescript
interface ContractSettings {
  baseHourly: number;      // Base hourly wage (Default: 9.92)
  festivePercent: number;  // Sunday / Festive percentage markup (Default: 30)
  nightPercent: number;    // Night hours percentage markup (Default: 25)
}
```

---

## ⚙️ Core Application Logic

### 1. Shift Type Auto-Detection
Based on the start time inputted in the shift form:
- `06:00` to `12:59` $\rightarrow$ **Mattina 🌅** (Morning)
- `13:00` to `21:59` $\rightarrow$ **Pomeriggio 🌇** (Afternoon)
- Other times $\rightarrow$ **Notturno/Altro 🌃** (Night/Other)

### 2. Earnings & Fiscal Calculations
- **Midnight Rollover**: Automatically handles shifts crossing midnight (`end < start` in hours).
- **Festive Supplement**: Applies Sunday rate multipliers (`festivePercent`) based on the shift day of the week.
- **Night Hours**: Calculates night supplements when the shift ends or runs through the night (`hEnd > 22` or `hEnd < 6`).
- **Net vs. Gross**: Net salary is estimated as **90%** of gross earnings (`gross * 0.9`).
- **Fiscal Tax Refund (Conguaglio)**: Tracks and displays a tax recovery estimation computed as **1.5%** of the year's total gross earnings, payable in December.

### 3. Calendar Synchronisation (`.ics`)
Generates standard iCalendar files on-the-fly for calendar apps:
- Includes shift info, colleagues, and notes.
- Configures an automatic alert (`VALARM`) to remind the user the **evening before the shift at 8:00 PM** (`TRIGGER:-P1DT14H` relative to shift start).

---

## 🚀 Building & Running

This project has no build pipeline or compilation step (pure static asset composition).

### Running a Local Server
To test IndexedDB, LocalStorage, and PWA capabilities (including Service Worker registrations), the app must be served from a secure origin or `localhost`. Running directly via the `file://` protocol is not supported for PWAs.

Use any of the following command-line tools:

#### Python 3
```bash
python3 -m http.server 8000
```

#### Node.js / npm
```bash
# Serve instantly
npx serve .

# Or install globally and run
npm install -g serve
serve .
```

---

## 🛠️ Development & Coding Conventions

- **Keep it Self-Contained**: The core logic is structured in `index.html` to minimize network overhead and script fragmentation. Maintain this structure unless splitting files becomes absolutely necessary.
- **CDN Management**: Tailwind and Lucide libraries are loaded through CDNs. Any addition to dependencies should prioritize reliable CDNs for simplicity.
- **Service Worker Updates**: When modifying any code, markup, stylesheet, or icon, you **MUST** update the `CACHE_NAME` constant in `sw.js` (e.g. from `App turni-v8` to `App -turni-v9`) so that users' browsers know to invalidate cache and fetch updated resources.
- **Mobile-First UX**: Retain iOS/Android standalone UI constraints, responsive buttons, collapsible historical month views (`details` elements), and clean mobile tap target limits.
