import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button, Text, Divider, TextInput, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { db } from '../database/database';
import { Symptom, Medication } from '../database/models';
import { format } from 'date-fns';

type SymptomDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SymptomDetail'
>;

type SymptomDetailScreenRouteProp = RouteProp<RootStackParamList, 'SymptomDetail'>;

interface Props {
  navigation: SymptomDetailScreenNavigationProp;
  route: SymptomDetailScreenRouteProp;
}

const SeverityIndicator: React.FC<{ severity: number }> = ({ severity }) => {
  const getColor = () => {
    if (severity <= 3) return '#4caf50';
    if (severity <= 6) return '#ff9800';
    return '#f44336';
  };

  return (
    <View style={styles.severityContainer}>
      {Array.from({ length: 10 }, (_, i) => (
        <View
          key={i}
          style={[
            styles.severityDot,
            {
              backgroundColor: i < severity ? getColor() : '#e0e0e0',
            },
          ]}
        />
      ))}
      <Text style={styles.severityText}>{severity}/10</Text>
    </View>
  );
};

const SymptomDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { symptomId } = route.params;
  const [symptom, setSymptom] = useState<Symptom | null>(null);
  const [linkedMedications, setLinkedMedications] = useState<Medication[]>([]);
  const [availableMedications, setAvailableMedications] = useState<Medication[]>([]);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionText, setDescriptionText] = useState('');

  const loadData = useCallback(() => {
    // Find the symptom
    const allAilments = db.getAllAilments();
    let foundSymptom: Symptom | null = null;

    for (const ailment of allAilments) {
      const symptoms = db.getSymptomsByAilment(ailment.id);
      const symptomMatch = symptoms.find(s => s.id === symptomId);
      if (symptomMatch) {
        foundSymptom = symptomMatch;
        break;
      }
    }

    setSymptom(foundSymptom);

    if (foundSymptom) {
      // Set description text
      setDescriptionText(foundSymptom.notes || '');
      
      // Get linked medications
      const linked = db.getMedicationsBySymptom(foundSymptom.id);
      setLinkedMedications(linked);

      // Get available medications to link
      const allMedications = db.getMedicationsByAilment(foundSymptom.ailmentId);
      const available = allMedications.filter(
        med => !linked.some(linked => linked.id === med.id)
      );
      setAvailableMedications(available);
    }
  }, [symptomId]);

  useFocusEffect(loadData);

  const handleLinkMedication = (medicationId: string) => {
    if (symptom) {
      db.linkSymptomToMedication(symptom.id, medicationId);
      loadData();
    }
  };

  const handleUnlinkMedication = (medicationId: string) => {
    if (symptom) {
      db.unlinkSymptomFromMedication(symptom.id, medicationId);
      loadData();
    }
  };

  const handleSaveDescription = () => {
    if (symptom) {
      // Update the symptom's notes in the database
      db.updateSymptom(symptom.id, { notes: descriptionText });
      setIsEditingDescription(false);
      loadData();
    }
  };

  const handleCancelEdit = () => {
    setDescriptionText(symptom?.notes || '');
    setIsEditingDescription(false);
  };

  if (!symptom) {
    return (
      <View style={styles.container}>
        <Text>Symptom not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Symptom Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.symptomTitle}>{symptom.name}</Title>

          <View style={styles.severitySection}>
            <Text style={styles.severityLabel}>Severity Level:</Text>
            <SeverityIndicator severity={symptom.severity} />
          </View>

          <Text style={styles.dateText}>
            Logged: {format(new Date(symptom.dateLogged), 'MMM dd, yyyy - h:mm a')}
          </Text>

          {symptom.notes && (
            <Paragraph style={styles.notes}>{symptom.notes}</Paragraph>
          )}
        </Card.Content>
      </Card>

      {/* Description Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.descriptionHeader}>
            <Title style={styles.sectionTitle}>Description</Title>
            {!isEditingDescription && (
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => setIsEditingDescription(true)}
              />
            )}
          </View>
          
          {isEditingDescription ? (
            <View style={styles.editContainer}>
              <TextInput
                mode="outlined"
                multiline
                numberOfLines={4}
                value={descriptionText}
                onChangeText={setDescriptionText}
                placeholder="Add a description for this symptom..."
                style={styles.descriptionInput}
              />
              <View style={styles.editButtons}>
                <Button
                  mode="text"
                  onPress={handleCancelEdit}
                  textColor="#666"
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveDescription}
                >
                  Save
                </Button>
              </View>
            </View>
          ) : (
            <Paragraph style={styles.descriptionText}>
              {symptom.notes ? symptom.notes : 'No additional description provided for this symptom.'}
            </Paragraph>
          )}
        </Card.Content>
      </Card>

      {/* Linked Medications */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Associated Medications</Title>

          {linkedMedications.length === 0 ? (
            <Text style={styles.emptyText}>No medications linked to this symptom</Text>
          ) : (
            linkedMedications.map((medication, index) => (
              <View key={medication.id}>
                {index > 0 && <Divider style={styles.divider} />}
                <View style={styles.medicationContainer}>
                  <View style={styles.medicationInfo}>
                    <Text style={styles.medicationName}>{medication.name}</Text>
                    <Text style={styles.medicationType}>
                      {medication.type} • {medication.dosage || 'No dosage specified'}
                    </Text>
                    {medication.frequency && (
                      <Text style={styles.medicationFrequency}>{medication.frequency}</Text>
                    )}
                  </View>
                  <View style={styles.medicationActions}>
                    <Button
                      mode="text"
                      onPress={() => navigation.navigate('MedicationDetail', { medicationId: medication.id })}
                    >
                      View
                    </Button>
                    <Button
                      mode="text"
                      onPress={() => handleUnlinkMedication(medication.id)}
                      textColor="#f44336"
                    >
                      Unlink
                    </Button>
                  </View>
                </View>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Available Medications to Link */}
      {availableMedications.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Link Additional Medications</Title>
            <Text style={styles.sectionSubtitle}>
              Other medications for this condition that could be linked to this symptom:
            </Text>

            {availableMedications.map((medication, index) => (
              <View key={medication.id}>
                {index > 0 && <Divider style={styles.divider} />}
                <View style={styles.medicationContainer}>
                  <View style={styles.medicationInfo}>
                    <Text style={styles.medicationName}>{medication.name}</Text>
                    <Text style={styles.medicationType}>
                      {medication.type} • {medication.dosage || 'No dosage specified'}
                    </Text>
                    {medication.frequency && (
                      <Text style={styles.medicationFrequency}>{medication.frequency}</Text>
                    )}
                  </View>
                  <Button
                    mode="outlined"
                    onPress={() => handleLinkMedication(medication.id)}
                  >
                    Link
                  </Button>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  symptomTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
  severitySection: {
    marginBottom: 16,
  },
  severityLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  severityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  severityText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  notes: {
    fontStyle: 'italic',
    color: '#666',
    marginTop: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginTop: 8,
  },
  descriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  editContainer: {
    marginTop: 8,
  },
  descriptionInput: {
    marginBottom: 12,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    paddingVertical: 16,
  },
  medicationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  medicationInfo: {
    flex: 1,
    marginRight: 12,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  medicationType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  medicationFrequency: {
    fontSize: 12,
    color: '#999',
  },
  medicationActions: {
    flexDirection: 'row',
  },
  divider: {
    marginVertical: 8,
  },
});

export default SymptomDetailScreen;