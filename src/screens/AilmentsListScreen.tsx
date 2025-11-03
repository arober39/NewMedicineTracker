import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, FAB, IconButton, Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { db } from '../database/database';
import { Ailment } from '../database/models';
import { format } from 'date-fns';

type AilmentsListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AilmentsList'
>;

interface Props {
  navigation: AilmentsListScreenNavigationProp;
}

const AilmentsListScreen: React.FC<Props> = ({ navigation }) => {
  const [ailments, setAilments] = useState<Ailment[]>([]);

  const loadAilments = useCallback(() => {
    const loadedAilments = db.getAllAilments();
    setAilments(loadedAilments);
  }, []);

  useFocusEffect(loadAilments);

  const handleDeleteAilment = (id: string) => {
    db.deleteAilment(id);
    loadAilments();
  };

  const renderAilmentCard = ({ item }: { item: Ailment }) => {
    const symptoms = db.getSymptomsByAilment(item.id);
    const medications = db.getMedicationsByAilment(item.id);

    return (
      <Card
        style={styles.card}
        onPress={() => navigation.navigate('AilmentDetail', { ailmentId: item.id })}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Title style={styles.cardTitle}>{item.name}</Title>
              <Paragraph style={styles.dateText}>
                Created: {format(new Date(item.dateCreated), 'MMM dd, yyyy')}
              </Paragraph>
            </View>
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDeleteAilment(item.id)}
            />
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{symptoms.length}</Text>
              <Text style={styles.statLabel}>Symptoms</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{medications.length}</Text>
              <Text style={styles.statLabel}>Medications</Text>
            </View>
          </View>

          {item.notes && (
            <Paragraph numberOfLines={2} style={styles.notes}>
              {item.notes}
            </Paragraph>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {ailments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No ailments tracked yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the + button to add your first health condition
          </Text>
        </View>
      ) : (
        <FlatList
          data={ailments}
          renderItem={renderAilmentCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddAilment')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
    backgroundColor: '#1e1e1e',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    color: '#e0e0e0',
  },
  dateText: {
    fontSize: 12,
    color: '#b0b0b0',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
    marginRight: 24,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#bb86fc',
  },
  statLabel: {
    fontSize: 12,
    color: '#b0b0b0',
    marginTop: 2,
  },
  notes: {
    marginTop: 8,
    fontStyle: 'italic',
    color: '#b0b0b0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e0e0e0',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#b0b0b0',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#bb86fc',
  },
});

export default AilmentsListScreen;