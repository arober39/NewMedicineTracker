# NewMedicineTracker

A comprehensive health and medication tracking mobile application built with React Native and Expo. Track your ailments, symptoms, medications, and dosage history all in one place.

## Features

### 🏥 Ailment Tracking
- Create and manage health conditions/ailments
- Add notes and track creation dates
- View summary statistics for each ailment

### 📊 Symptom Management
- Log symptoms associated with specific ailments
- Rate symptom severity on a 1-10 scale
- Track symptom history with dates and notes
- Link symptoms to medications for correlation tracking

### 💊 Medication Tracking
- Track medications, supplements, vitamins, and herbal remedies
- Categorize by type (Medication, Supplement, Vitamin, Herbal, Other)
- Record dosage information and frequency
- Set start and end dates for medication courses
- Add detailed notes for each medication

### 📝 Dosage Logging
- Log individual dosage entries for each medication
- Track whether medication was taken (taken/missed)
- Record dosage amounts and add notes per entry
- View complete dosage history

### 🔗 Relationship Tracking
- Link symptoms to medications to track effectiveness
- View which medications are associated with specific symptoms
- Organize all health data by ailment

## Tech Stack

- **Framework**: React Native 0.81.4
- **Platform**: Expo ~54.0.13
- **Language**: TypeScript 5.9.2
- **Navigation**: React Navigation (Native Stack)
- **UI Components**: React Native Paper 5.14.5
- **Database**: Expo SQLite (local SQLite database)
- **Date Handling**: date-fns 4.1.0
- **Date Picker**: @react-native-community/datetimepicker

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for iOS development on macOS)
- Android Studio and Android SDK (for Android development)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd NewMedicineTracker
```

2. Install dependencies:
```bash
npm install
```

3. For iOS, install CocoaPods dependencies:
```bash
cd ios
pod install
cd ..
```

## Running the App

### Start the Expo development server:
```bash
npm start
```

### Run on iOS:
```bash
npm run ios
```

### Run on Android:
```bash
npm run android
```

### Run on Web:
```bash
npm run web
```

## Project Structure

```
NewMedicineTracker/
├── src/
│   ├── database/
│   │   ├── database.ts      # SQLite database manager
│   │   └── models.ts         # TypeScript interfaces for data models
│   └── screens/
│       ├── AilmentsListScreen.tsx        # Main screen showing all ailments
│       ├── AilmentDetailScreen.tsx       # Detailed view of an ailment
│       ├── AddAilmentScreen.tsx          # Add new ailment form
│       ├── AddSymptomScreen.tsx          # Add symptom form
│       ├── AddMedicationScreen.tsx       # Add medication form
│       ├── SymptomDetailScreen.tsx       # Detailed view of a symptom
│       ├── MedicationDetailScreen.tsx    # Detailed view of a medication
│       └── AddDosageEntryScreen.tsx      # Log dosage entry form
├── App.tsx                    # Main app component with navigation
├── app.json                    # Expo configuration
├── package.json                # Dependencies and scripts
└── tsconfig.json               # TypeScript configuration
```

## Database Schema

The app uses a local SQLite database with the following tables:

- **ailments**: Health conditions/ailments
- **symptoms**: Symptoms associated with ailments
- **medications**: Medications and supplements
- **dosageEntries**: Individual dosage logs
- **symptomMedications**: Junction table linking symptoms to medications

All data is stored locally on the device and is not synced to any cloud service.

## Key Features Implementation

### Data Models
- `Ailment`: Health condition with name, notes, and creation date
- `Symptom`: Symptom with severity (1-10), date logged, and notes
- `Medication`: Medication with type, dosage, frequency, and date range
- `DosageEntry`: Individual dosage log with taken status and optional notes
- `SymptomMedication`: Relationship between symptoms and medications

### Navigation
The app uses React Navigation's Native Stack Navigator with the following screens:
- Ailments List (Home)
- Ailment Detail
- Add Ailment
- Add Symptom
- Add Medication
- Symptom Detail
- Medication Detail
- Add Dosage Entry

## UI/UX

- **Dark Theme**: Modern dark interface with Material Design components
- **Card-based Layout**: Clean, organized card interface for easy navigation
- **Floating Action Button**: Quick access to add new items
- **Modal Presentations**: Add/edit screens use modal presentation for better UX
- **Empty States**: Helpful messages when no data is available

## Development

### TypeScript
The project is fully typed with TypeScript. Type definitions for navigation are defined in `App.tsx` as `RootStackParamList`.

### Database Operations
All database operations are handled through the `DatabaseManager` class in `src/database/database.ts`. The database is initialized automatically when the app starts.

## Building for Production

### iOS
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

Note: You'll need to set up an Expo account and configure EAS Build for production builds.

## Privacy & Security

- All data is stored locally on the device
- No data is transmitted to external servers
- No user accounts or authentication required
- Data is stored in SQLite database files on the device

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Version

Current version: 1.0.0

---

Built with ❤️ using React Native and Expo

