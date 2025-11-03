import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { TextInput, Button, Card, Title, Switch, Text } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { db } from '../database/database';

type AddDosageEntryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddDosageEntry'
>;

type AddDosageEntryScreenRouteProp = RouteProp<RootStackParamList, 'AddDosageEntry'>;

interface Props {
  navigation: AddDosageEntryScreenNavigationProp;
  route: AddDosageEntryScreenRouteProp;
}

const AddDosageEntryScreen: React.FC<Props> = ({ navigation, route }) => {
  const { medicationId } = route.params;
  const [date, setDate] = useState(new Date().toISOString());
  const [taken, setTaken] = useState(true);
  const [dosageAmount, setDosageAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Get medication info to pre-fill dosage
  React.useEffect(() => {
    const medications = db.getAllMedications();
    const medication = medications.find(m => m.id === medicationId);
    if (medication?.dosage) {
      setDosageAmount(medication.dosage);
    }
  }, [medicationId]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate.toISOString());
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const newEntry = db.createDosageEntry({
        medicationId,
        date,
        taken,
        dosageAmount: dosageAmount.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error creating dosage entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const medications = db.getAllMedications();
  const medication = medications.find(m => m.id === medicationId);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Log Dosage</Title>

          {/* Medication Info */}
          <Card style={styles.infoCard}>
            <Card.Content>
              <Text style={styles.medicationName}>{medication?.name || 'Unknown Medication'}</Text>
              {medication?.dosage && (
                <Text style={styles.medicationInfo}>Default Dosage: {medication.dosage}</Text>
              )}
              {medication?.frequency && (
                <Text style={styles.medicationInfo}>Frequency: {medication.frequency}</Text>
              )}
            </Card.Content>
          </Card>

          <TextInput
            label="Date & Time"
            value={new Date(date).toLocaleString()}
            mode="outlined"
            style={styles.input}
            editable={false}
            right={
              <TextInput.Icon
                icon="calendar"
                onPress={() => setShowDatePicker(true)}
              />
            }
          />

          {showDatePicker && (
            <DateTimePicker
              value={new Date(date)}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
            />
          )}

          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Medication Taken</Text>
            <Switch
              value={taken}
              onValueChange={setTaken}
            />
          </View>

          <TextInput
            label="Dosage Amount (Optional)"
            value={dosageAmount}
            onChangeText={setDosageAmount}
            mode="outlined"
            style={styles.input}
            placeholder={medication?.dosage || "Enter dosage amount"}
          />

          <TextInput
            label="Notes (Optional)"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            placeholder="Any notes about this dosage..."
          />

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.button}
              disabled={isLoading}
            >
              Cancel
            </Button>

            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.button}
              disabled={isLoading}
              loading={isLoading}
            >
              Save
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  card: {
    margin: 16,
    elevation: 2,
    backgroundColor: '#1e1e1e',
  },
  infoCard: {
    marginBottom: 16,
    backgroundColor: '#2a2a2a',
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
    color: '#e0e0e0',
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e0e0e0',
    marginBottom: 4,
  },
  medicationInfo: {
    fontSize: 14,
    color: '#b0b0b0',
    marginBottom: 2,
  },
  input: {
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#e0e0e0',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default AddDosageEntryScreen;