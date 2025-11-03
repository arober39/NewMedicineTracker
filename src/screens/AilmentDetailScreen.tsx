import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button, Text, Divider, Chip } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { db } from '../database/database';
import { Ailment, Symptom, Medication } from '../database/models';
import { format } from 'date-fns';

type AilmentDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AilmentDetail'
>;

type AilmentDetailScreenRouteProp = RouteProp<RootStackParamList, 'AilmentDetail'>;

interface Props {
  navigation: AilmentDetailScreenNavigationProp;
  route: AilmentDetailScreenRouteProp;
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

const TypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const getColor = () => {
    switch (type) {
      case 'Medication': return '#2196f3';
      case 'Supplement': return '#4caf50';
      case 'Vitamin': return '#ff9800';
      case 'Herbal': return '#9c27b0';
      default: return '#757575';
    }
  };

  return (
    <Chip
      mode="outlined"
      textStyle={{ color: getColor(), fontSize: 12 }}
      style={{ borderColor: getColor() }}
    >
      {type}
    </Chip>
  );
};

const AilmentDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { ailmentId } = route.params;
  const [ailment, setAilment] = useState<Ailment | null>(null);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);

  const loadData = useCallback(() => {
    const ailments = db.getAllAilments();
    const foundAilment = ailments.find(a => a.id === ailmentId);
    setAilment(foundAilment || null);

    const loadedSymptoms = db.getSymptomsByAilment(ailmentId);
    setSymptoms(loadedSymptoms);

    const loadedMedications = db.getMedicationsByAilment(ailmentId);
    setMedications(loadedMedications);
  }, [ailmentId]);

  useFocusEffect(loadData);

  if (!ailment) {
    return (
      <View style={styles.container}>
        <Text>Ailment not found</Text>
      </View>
    );
  }

  const handleDeleteSymptom = (id: string) => {
    db.deleteSymptom(id);
    loadData();
  };

  const handleDeleteMedication = (id: string) => {
    db.deleteMedication(id);
    loadData();
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
      bounces={true}
    >
      {/* Ailment Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.ailmentTitle}>{ailment.name}</Title>
          <Paragraph style={styles.dateText}>
            Created: {format(new Date(ailment.dateCreated), 'MMM dd, yyyy')}
          </Paragraph>
          {ailment.notes && (
            <Paragraph style={styles.notes}>{ailment.notes}</Paragraph>
          )}
        </Card.Content>
      </Card>

      {/* Symptoms Section */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>Symptoms</Title>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('AddSymptom', { ailmentId })}
            >
              Add
            </Button>
          </View>

          {symptoms.length === 0 ? (
            <Text style={styles.emptyText}>No symptoms logged yet</Text>
          ) : (
            symptoms.map((symptom, index) => (
              <View key={symptom.id}>
                {index > 0 && <Divider style={styles.divider} />}
                <View style={styles.itemContainer}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{symptom.name}</Text>
                    <Button
                      mode="text"
                      onPress={() => handleDeleteSymptom(symptom.id)}
                      textColor="#f44336"
                    >
                      Delete
                    </Button>
                  </View>

                  <SeverityIndicator severity={symptom.severity} />

                  <Text style={styles.dateText}>
                    {format(new Date(symptom.dateLogged), 'MMM dd, yyyy - h:mm a')}
                  </Text>

                  {symptom.notes && (
                    <Text style={styles.itemNotes}>{symptom.notes}</Text>
                  )}

                  <Button
                    mode="text"
                    onPress={() => navigation.navigate('SymptomDetail', { symptomId: symptom.id })}
                  >
                    View Details
                  </Button>
                </View>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Medications Section */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>Medications & Supplements</Title>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('AddMedication', { ailmentId })}
            >
              Add
            </Button>
          </View>

          {medications.length === 0 ? (
            <Text style={styles.emptyText}>No medications added yet</Text>
          ) : (
            medications.map((medication, index) => (
              <View key={medication.id}>
                {index > 0 && <Divider style={styles.divider} />}
                <View style={styles.itemContainer}>
                  <View style={styles.itemHeader}>
                    <View style={styles.medicationHeader}>
                      <Text style={styles.itemTitle}>{medication.name}</Text>
                      <TypeBadge type={medication.type} />
                    </View>
                    <Button
                      mode="text"
                      onPress={() => handleDeleteMedication(medication.id)}
                      textColor="#f44336"
                    >
                      Delete
                    </Button>
                  </View>

                  <View style={styles.medicationInfo}>
                    {medication.dosage && (
                      <Text style={styles.medicationDetail}>
                        Dosage: {medication.dosage}
                      </Text>
                    )}
                    {medication.frequency && (
                      <Text style={styles.medicationDetail}>
                        Frequency: {medication.frequency}
                      </Text>
                    )}
                    <Text style={styles.dateText}>
                      Started: {format(new Date(medication.startDate), 'MMM dd, yyyy')}
                    </Text>
                    {medication.endDate ? (
                      <Text style={styles.dateText}>
                        Ended: {format(new Date(medication.endDate), 'MMM dd, yyyy')}
                      </Text>
                    ) : (
                      <Text style={[styles.dateText, { color: '#4caf50' }]}>Active</Text>
                    )}
                  </View>

                  {medication.notes && (
                    <Text style={styles.itemNotes}>{medication.notes}</Text>
                  )}

                  <View style={styles.medicationButtons}>
                    <Button
                      mode="outlined"
                      onPress={() => navigation.navigate('AddDosageEntry', { medicationId: medication.id })}
                      style={styles.logDosageButton}
                    >
                      Log Dosage
                    </Button>
                    <Button
                      mode="text"
                      onPress={() => navigation.navigate('MedicationDetail', { medicationId: medication.id })}
                    >
                      View Details
                    </Button>
                  </View>
                </View>
              </View>
            ))
          )}
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
    backgroundColor: '#1e1e1e',
  },
  ailmentTitle: {
    fontSize: 24,
    marginBottom: 8,
    color: '#e0e0e0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#e0e0e0',
  },
  dateText: {
    fontSize: 12,
    color: '#b0b0b0',
    marginBottom: 8,
  },
  notes: {
    fontStyle: 'italic',
    color: '#b0b0b0',
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#b0b0b0',
    fontStyle: 'italic',
    paddingVertical: 16,
  },
  itemContainer: {
    paddingVertical: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  medicationHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    color: '#e0e0e0',
  },
  itemNotes: {
    fontStyle: 'italic',
    color: '#b0b0b0',
    marginTop: 8,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
  },
  severityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 3,
  },
  severityText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#b0b0b0',
  },
  medicationInfo: {
    marginBottom: 8,
  },
  medicationDetail: {
    fontSize: 14,
    color: '#e0e0e0',
    marginBottom: 4,
  },
  medicationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  logDosageButton: {
    flex: 1,
    marginRight: 8,
  },
});

export default AilmentDetailScreen;