import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { TextInput, Button, Card, Title, SegmentedButtons, Switch, Text } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { db } from '../database/database';
import { Medication } from '../database/models';

type AddMedicationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddMedication'
>;

type AddMedicationScreenRouteProp = RouteProp<RootStackParamList, 'AddMedication'>;

interface Props {
  navigation: AddMedicationScreenNavigationProp;
  route: AddMedicationScreenRouteProp;
}

const AddMedicationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { ailmentId } = route.params;
  const [name, setName] = useState('');
  const [type, setType] = useState<Medication['type']>('Medication');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString());
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState(new Date().toISOString());
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const medicationTypes = [
    { value: 'Medication', label: 'Medication' },
    { value: 'Supplement', label: 'Supplement' },
    { value: 'Vitamin', label: 'Vitamin' },
    { value: 'Herbal', label: 'Herbal' },
    { value: 'Other', label: 'Other' },
  ];

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate.toISOString());
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate.toISOString());
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const newMedication = db.createMedication({
        ailmentId,
        name: name.trim(),
        type,
        dosage: dosage.trim() || undefined,
        frequency: frequency.trim() || undefined,
        startDate,
        endDate: hasEndDate ? endDate : undefined,
        notes: notes.trim() || undefined,
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error creating medication:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Add New {type}</Title>

          <TextInput
            label="Name *"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            placeholder="e.g., Mesalamine, Vitamin D3, etc."
          />

          <View style={styles.typeContainer}>
            <Text style={styles.sectionLabel}>Type</Text>
            <SegmentedButtons
              value={type}
              onValueChange={(value) => setType(value as Medication['type'])}
              buttons={medicationTypes}
              style={styles.segmentedButtons}
            />
          </View>

          <TextInput
            label="Dosage"
            value={dosage}
            onChangeText={setDosage}
            mode="outlined"
            style={styles.input}
            placeholder="e.g., 500mg, 2 tablets, 1 capsule"
          />

          <TextInput
            label="Frequency"
            value={frequency}
            onChangeText={setFrequency}
            mode="outlined"
            style={styles.input}
            placeholder="e.g., twice daily, once a week, as needed"
          />

          <View style={styles.dateSection}>
            <Text style={styles.sectionLabel}>Schedule</Text>

            <TextInput
              label="Start Date"
              value={new Date(startDate).toLocaleDateString()}
              mode="outlined"
              style={styles.input}
              editable={false}
              right={
                <TextInput.Icon
                  icon="calendar"
                  onPress={() => setShowStartDatePicker(true)}
                />
              }
            />

            {showStartDatePicker && (
              <DateTimePicker
                value={new Date(startDate)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleStartDateChange}
              />
            )}

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Has End Date</Text>
              <Switch
                value={hasEndDate}
                onValueChange={setHasEndDate}
              />
            </View>

            {hasEndDate && (
              <>
                <TextInput
                  label="End Date"
                  value={new Date(endDate).toLocaleDateString()}
                  mode="outlined"
                  style={styles.input}
                  editable={false}
                  right={
                    <TextInput.Icon
                      icon="calendar"
                      onPress={() => setShowEndDatePicker(true)}
                    />
                  }
                />

                {showEndDatePicker && (
                  <DateTimePicker
                    value={new Date(endDate)}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleEndDateChange}
                  />
                )}
              </>
            )}
          </View>

          <TextInput
            label="Notes (Optional)"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
            placeholder="Additional information, side effects, etc."
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
              disabled={!name.trim() || isLoading}
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
  title: {
    marginBottom: 24,
    textAlign: 'center',
    color: '#e0e0e0',
  },
  input: {
    marginBottom: 16,
  },
  typeContainer: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#e0e0e0',
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  dateSection: {
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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

export default AddMedicationScreen;