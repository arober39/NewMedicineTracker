import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import AilmentsListScreen from './src/screens/AilmentsListScreen';
import AilmentDetailScreen from './src/screens/AilmentDetailScreen';
import AddAilmentScreen from './src/screens/AddAilmentScreen';
import AddSymptomScreen from './src/screens/AddSymptomScreen';
import AddMedicationScreen from './src/screens/AddMedicationScreen';
import SymptomDetailScreen from './src/screens/SymptomDetailScreen';
import MedicationDetailScreen from './src/screens/MedicationDetailScreen';
import AddDosageEntryScreen from './src/screens/AddDosageEntryScreen';

export type RootStackParamList = {
  AilmentsList: undefined;
  AilmentDetail: { ailmentId: string };
  AddAilment: undefined;
  AddSymptom: { ailmentId: string };
  AddMedication: { ailmentId: string };
  SymptomDetail: { symptomId: string };
  MedicationDetail: { medicationId: string };
  AddDosageEntry: { medicationId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="AilmentsList"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#1a1a1a',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen
              name="AilmentsList"
              component={AilmentsListScreen}
              options={{ title: 'Health Tracker' }}
            />
            <Stack.Screen
              name="AilmentDetail"
              component={AilmentDetailScreen}
              options={{ title: 'Ailment Details' }}
            />
            <Stack.Screen
              name="AddAilment"
              component={AddAilmentScreen}
              options={{ title: 'Add Ailment', presentation: 'modal' }}
            />
            <Stack.Screen
              name="AddSymptom"
              component={AddSymptomScreen}
              options={{ title: 'Add Symptom', presentation: 'modal' }}
            />
            <Stack.Screen
              name="AddMedication"
              component={AddMedicationScreen}
              options={{ title: 'Add Medication', presentation: 'modal' }}
            />
            <Stack.Screen
              name="SymptomDetail"
              component={SymptomDetailScreen}
              options={{ title: 'Symptom Details' }}
            />
            <Stack.Screen
              name="MedicationDetail"
              component={MedicationDetailScreen}
              options={{ title: 'Medication Details' }}
            />
            <Stack.Screen
              name="AddDosageEntry"
              component={AddDosageEntryScreen}
              options={{ title: 'Log Dosage', presentation: 'modal' }}
            />
          </Stack.Navigator>
          <StatusBar style="light" />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
