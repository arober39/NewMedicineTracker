import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Card, Title } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { db } from '../database/database';

type AddAilmentScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddAilment'
>;

interface Props {
  navigation: AddAilmentScreenNavigationProp;
}

const AddAilmentScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const newAilment = db.createAilment({
        name: name.trim(),
        notes: notes.trim() || undefined,
        dateCreated: new Date().toISOString(),
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error creating ailment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Add New Ailment</Title>

          <TextInput
            label="Ailment Name *"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            placeholder="e.g., Crohn's Disease, Migraines, etc."
          />

          <TextInput
            label="Notes (Optional)"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
            placeholder="Additional information about this condition..."
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

export default AddAilmentScreen;