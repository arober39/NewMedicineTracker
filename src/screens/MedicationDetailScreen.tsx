import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Card, Title, Paragraph, Button, Text, Chip, Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { db } from '../database/database';
import { Medication, DosageEntry } from '../database/models';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';

type MedicationDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MedicationDetail'
>;

type MedicationDetailScreenRouteProp = RouteProp<RootStackParamList, 'MedicationDetail'>;

interface Props {
  navigation: MedicationDetailScreenNavigationProp;
  route: MedicationDetailScreenRouteProp;
}

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

const WeeklyChart: React.FC<{ dosageEntries: DosageEntry[] }> = ({ dosageEntries }) => {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 64;
  const dayWidth = chartWidth / 7;

  const weekData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const entry = dosageEntries.find(entry =>
      isSameDay(new Date(entry.date), date)
    );

    return {
      date,
      taken: entry?.taken || false,
      dayLabel: format(date, 'EEE'),
    };
  });

  return (
    <Card style={styles.chartCard}>
      <Card.Content>
        <Title style={styles.chartTitle}>Weekly Progress</Title>
        <View style={styles.chartContainer}>
          {weekData.map((day, index) => (
            <View key={index} style={[styles.dayColumn, { width: dayWidth }]}>
              <Text style={styles.dayLabel}>{day.dayLabel}</Text>
              <View
                style={[
                  styles.dayIndicator,
                  {
                    backgroundColor: day.taken ? '#4caf50' : '#f44336',
                  },
                ]}
              >
                <Text style={styles.dayIcon}>
                  {day.taken ? '✓' : '✗'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
};

const MedicationDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { medicationId } = route.params;
  const [medication, setMedication] = useState<Medication | null>(null);
  const [dosageEntries, setDosageEntries] = useState<DosageEntry[]>([]);

  const loadData = useCallback(() => {
    const medications = db.getAllMedications();
    const foundMedication = medications.find(m => m.id === medicationId);
    setMedication(foundMedication || null);

    const entries = db.getDosageEntriesByMedication(medicationId);
    setDosageEntries(entries);
  }, [medicationId]);

  useFocusEffect(loadData);

  const handleDeleteDosageEntry = (id: string) => {
    db.deleteDosageEntry(id);
    loadData();
  };

  if (!medication) {
    return (
      <View style={styles.container}>
        <Text>Medication not found</Text>
      </View>
    );
  }

  const recentEntries = dosageEntries.slice(0, 7);

  return (
    <ScrollView style={styles.container}>
      {/* Medication Info */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.medicationHeader}>
            <Title style={styles.medicationTitle}>{medication.name}</Title>
            <TypeBadge type={medication.type} />
          </View>

          {medication.dosage && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dosage:</Text>
              <Text style={styles.infoValue}>{medication.dosage}</Text>
            </View>
          )}

          {medication.frequency && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Frequency:</Text>
              <Text style={styles.infoValue}>{medication.frequency}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Started:</Text>
            <Text style={styles.infoValue}>
              {format(new Date(medication.startDate), 'MMM dd, yyyy')}
            </Text>
          </View>

          {medication.endDate ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ended:</Text>
              <Text style={styles.infoValue}>
                {format(new Date(medication.endDate), 'MMM dd, yyyy')}
              </Text>
            </View>
          ) : (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text style={[styles.infoValue, { color: '#4caf50' }]}>Active</Text>
            </View>
          )}

          {medication.notes && (
            <Paragraph style={styles.notes}>{medication.notes}</Paragraph>
          )}
        </Card.Content>
      </Card>

      {/* Weekly Chart */}
      <WeeklyChart dosageEntries={dosageEntries} />

      {/* Recent Dosage Entries */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>Recent Dosage Log</Title>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('AddDosageEntry', { medicationId })}
            >
              Add Entry
            </Button>
          </View>

          {recentEntries.length === 0 ? (
            <Text style={styles.emptyText}>No dosage entries logged yet</Text>
          ) : (
            recentEntries.map((entry, index) => (
              <View key={entry.id}>
                {index > 0 && <Divider style={styles.divider} />}
                <View style={styles.entryContainer}>
                  <View style={styles.entryHeader}>
                    <View style={styles.entryDateTime}>
                      <Text style={styles.entryDate}>
                        {format(new Date(entry.date), 'MMM dd, yyyy')}
                      </Text>
                      <Text style={styles.entryTime}>
                        {format(new Date(entry.date), 'h:mm a')}
                      </Text>
                    </View>
                    <View style={styles.entryStatus}>
                      <View
                        style={[
                          styles.statusIndicator,
                          {
                            backgroundColor: entry.taken ? '#4caf50' : '#f44336',
                          },
                        ]}
                      >
                        <Text style={styles.statusText}>
                          {entry.taken ? '✓' : '✗'}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.statusLabel,
                          {
                            color: entry.taken ? '#4caf50' : '#f44336',
                          },
                        ]}
                      >
                        {entry.taken ? 'Taken' : 'Missed'}
                      </Text>
                    </View>
                    <Button
                      mode="text"
                      onPress={() => handleDeleteDosageEntry(entry.id)}
                      textColor="#f44336"
                    >
                      Delete
                    </Button>
                  </View>

                  {entry.dosageAmount && (
                    <Text style={styles.dosageAmount}>
                      Amount: {entry.dosageAmount}
                    </Text>
                  )}

                  {entry.notes && (
                    <Text style={styles.entryNotes}>{entry.notes}</Text>
                  )}
                </View>
              </View>
            ))
          )}

          {dosageEntries.length > 7 && (
            <Button
              mode="text"
              onPress={() => {
                // Navigate to all entries view (could implement this)
              }}
              style={styles.viewAllButton}
            >
              View All Entries ({dosageEntries.length})
            </Button>
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
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
    backgroundColor: '#1e1e1e',
  },
  chartCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
    backgroundColor: '#1e1e1e',
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  medicationTitle: {
    fontSize: 24,
    flex: 1,
    color: '#e0e0e0',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: 'bold',
    width: 80,
    color: '#e0e0e0',
  },
  infoValue: {
    flex: 1,
    color: '#b0b0b0',
  },
  notes: {
    fontStyle: 'italic',
    color: '#b0b0b0',
    marginTop: 12,
  },
  chartTitle: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  dayColumn: {
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 12,
    color: '#b0b0b0',
    marginBottom: 8,
  },
  dayIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayIcon: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    paddingVertical: 16,
  },
  entryContainer: {
    paddingVertical: 8,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryDateTime: {
    flex: 1,
  },
  entryDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  entryTime: {
    fontSize: 12,
    color: '#b0b0b0',
  },
  entryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  dosageAmount: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  entryNotes: {
    fontStyle: 'italic',
    color: '#b0b0b0',
    marginTop: 4,
  },
  divider: {
    marginVertical: 12,
  },
  viewAllButton: {
    marginTop: 12,
  },
});

export default MedicationDetailScreen;