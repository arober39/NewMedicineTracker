import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { TextInput, Button, Card, Title, Text } from 'react-native-paper';
import { Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
// import Slider from '@react-native-community/slider';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { db } from '../database/database';

type AddSymptomScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddSymptom'
>;

type AddSymptomScreenRouteProp = RouteProp<RootStackParamList, 'AddSymptom'>;

interface Props {
  navigation: AddSymptomScreenNavigationProp;
  route: AddSymptomScreenRouteProp;
}

const AddSymptomScreen: React.FC<Props> = ({ navigation, route }) => {
  const { ailmentId } = route.params;
  const [name, setName] = useState('');
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState('');
  const [dateLogged, setDateLogged] = useState(new Date().toISOString());
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      console.log('Symptom name is required');
      return;
    }

    console.log('Saving symptom with data:', {
      ailmentId,
      name: name.trim(),
      severity,
      dateLogged,
      notes: notes.trim() || undefined,
    });

    setIsLoading(true);
    try {
      const newSymptom = db.createSymptom({
        ailmentId,
        name: name.trim(),
        severity,
        dateLogged,
        notes: notes.trim() || undefined,
      });

      console.log('Symptom created successfully:', newSymptom);
      navigation.goBack();
    } catch (error) {
      console.error('Error creating symptom:', error);
      Alert.alert(
        'Error',
        'Failed to save symptom. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = () => {
    if (severity <= 3) return '#4caf50';
    if (severity <= 6) return '#ff9800';
    return '#f44336';
  };

  const getSeverityLabel = () => {
    if (severity <= 3) return 'Mild';
    if (severity <= 6) return 'Moderate';
    return 'Severe';
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateLogged(selectedDate.toISOString());
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Add New Symptom</Title>

          <TextInput
            label="Symptom Name *"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            placeholder="e.g., Abdominal Pain, Headache, etc."
          />

          <View style={styles.severityContainer}>
            <Text style={styles.severityLabel}>
              Severity: {severity}/10 - {getSeverityLabel()}
            </Text>
            <View style={styles.severityButtons}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
                <Button
                  key={value}
                  mode={severity === value ? "contained" : "outlined"}
                  onPress={() => setSeverity(value)}
                  style={[
                    styles.severityButton,
                    { backgroundColor: severity === value ? getSeverityColor() : 'transparent' }
                  ]}
                  textColor={severity === value ? 'white' : getSeverityColor()}
                >
                  {value}
                </Button>
              ))}
            </View>
            <View style={styles.severityScale}>
              <Text style={styles.scaleText}>1 - Mild</Text>
              <Text style={styles.scaleText}>10 - Severe</Text>
            </View>
          </View>

          <TextInput
            label="Date & Time"
            value={new Date(dateLogged).toLocaleString()}
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
              value={new Date(dateLogged)}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
            />
          )}

          <TextInput
            label="Notes (Optional)"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
            placeholder="Additional details about this symptom..."
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
  severityContainer: {
    marginBottom: 16,
  },
  severityLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#e0e0e0',
  },
  severityButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  severityButton: {
    width: '9%',
    minWidth: 30,
    marginBottom: 8,
  },
  severityScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  scaleText: {
    fontSize: 12,
    color: '#b0b0b0',
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

export default AddSymptomScreen;