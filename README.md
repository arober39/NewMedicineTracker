# Health Tracker - Web Application

A web-based health tracking application for managing ailments, symptoms, medications, and dosage logs.
Javascript version of mobile react native version. 

## Features

- Track multiple health conditions (ailments)
- Log symptoms with severity ratings (1-10 scale)
- Manage medications, supplements, vitamins, and herbal remedies
- Log medication dosages with timestamps
- Link symptoms to medications
- View weekly medication adherence charts
- Dark theme UI optimized for web browsers

## Technology Stack

- **React 18** - UI framework
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server
- **IndexedDB** - Browser-based database storage
- **date-fns** - Date formatting utilities

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
  ├── database/
  │   ├── database.js      # IndexedDB database manager
  │   └── models.js       # Data model definitions
  ├── screens/
  │   ├── AilmentsListScreen.jsx
  │   ├── AilmentDetailScreen.jsx
  │   ├── AddAilmentScreen.jsx
  │   ├── AddSymptomScreen.jsx
  │   ├── AddMedicationScreen.jsx
  │   ├── SymptomDetailScreen.jsx
  │   ├── MedicationDetailScreen.jsx
  │   ├── AddDosageEntryScreen.jsx
  │   └── ScreenStyles.css
  ├── App.jsx              # Main app component with routing
  ├── main.jsx             # Application entry point
  └── styles.css           # Global styles
```

## Data Storage

All data is stored locally in the browser using IndexedDB. No data is sent to external servers. Your data remains private and is stored only on your device.

## Browser Support

This application requires a modern browser with IndexedDB support:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Migration from React Native

This application has been refactored from a React Native mobile app to a web application. Key changes:

- React Native components → React web components
- React Navigation → React Router
- Expo SQLite → IndexedDB
- React Native Paper → Custom CSS components
- TypeScript → JavaScript

## License

Private project
