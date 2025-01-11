import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, isValid, parseISO } from 'date-fns';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Insights: undefined;
  Journal: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

interface JournalEntry {
  id: string;
  date: string;
  content: string;
  title: string;
}

const STORAGE_KEY = '@journal_entries';
const screenHeight = Dimensions.get('window').height;

export default function JournalScreen({ navigation }: Props) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [isNewEntry, setIsNewEntry] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const savedEntries = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedEntries) {
        setEntries(JSON.parse(savedEntries));
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        return 'Invalid Date';
      }
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const createNewEntry = () => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      content: '',
      title: '',
    };
    setCurrentEntry(newEntry);
    setIsNewEntry(true);
    setShowEditor(true);
  };

  const openEntry = (entry: JournalEntry) => {
    setCurrentEntry(entry);
    setIsNewEntry(false);
    setShowEditor(true);
  };

  const saveEntry = async () => {
    if (!currentEntry) return;
    
    if (!currentEntry.content.trim()) {
      Alert.alert('Error', 'Please write something in your journal');
      return;
    }

    try {
      let updatedEntries;
      if (isNewEntry) {
        updatedEntries = [currentEntry, ...entries];
      } else {
        updatedEntries = entries.map(entry =>
          entry.id === currentEntry.id ? currentEntry : entry
        );
      }
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
      setEntries(updatedEntries);
      setShowEditor(false);
      setCurrentEntry(null);
    } catch (error) {
      console.error('Error saving journal entry:', error);
      Alert.alert('Error', 'Failed to save journal entry');
    }
  };

  const deleteEntry = async (id: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedEntries = entries.filter(entry => entry.id !== id);
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
              setEntries(updatedEntries);
              setShowEditor(false);
            } catch (error) {
              console.error('Error deleting journal entry:', error);
              Alert.alert('Error', 'Failed to delete journal entry');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#264653" />
        </TouchableOpacity>
        <Text style={styles.title}>Journal</Text>
      </View>

      <ScrollView style={styles.entriesContainer}>
        {entries.map(entry => (
          <TouchableOpacity
            key={entry.id}
            style={styles.entryCard}
            onPress={() => openEntry(entry)}
          >
            <View style={styles.cardContent}>
              <Text style={styles.entryDate}>
                {formatDate(entry.date)}
              </Text>
              <Text 
                style={styles.entryPreview}
                numberOfLines={3}
              >
                {entry.content}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={createNewEntry}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        visible={showEditor}
        animationType="slide"
        onRequestClose={() => {
          if (currentEntry?.content.trim()) {
            setShowEditor(false);
          } else {
            Alert.alert(
              'Discard Entry',
              'Are you sure you want to discard this entry?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Discard',
                  style: 'destructive',
                  onPress: () => setShowEditor(false)
                }
              ]
            );
          }
        }}
      >
        <SafeAreaView style={styles.editorContainer}>
          <View style={styles.editorHeader}>
            <TouchableOpacity
              style={styles.editorButton}
              onPress={() => {
                if (currentEntry?.content.trim()) {
                  setShowEditor(false);
                } else {
                  Alert.alert(
                    'Discard Entry',
                    'Are you sure you want to discard this entry?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Discard',
                        style: 'destructive',
                        onPress: () => setShowEditor(false)
                      }
                    ]
                  );
                }
              }}
            >
              <Ionicons name="close" size={24} color="#264653" />
            </TouchableOpacity>
            <Text style={styles.editorTitle}>
              {isNewEntry ? 'New Entry' : formatDate(currentEntry?.date || new Date().toISOString())}
            </Text>
            <View style={styles.editorActions}>
              {!isNewEntry && (
                <TouchableOpacity
                  style={[styles.editorButton, styles.deleteButton]}
                  onPress={() => currentEntry && deleteEntry(currentEntry.id)}
                >
                  <Ionicons name="trash-outline" size={24} color="#E76F51" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.editorButton, styles.saveButton]}
                onPress={saveEntry}
              >
                <Ionicons name="checkmark" size={24} color="#2A9D8F" />
              </TouchableOpacity>
            </View>
          </View>
          <TextInput
            style={styles.editor}
            value={currentEntry?.content}
            onChangeText={(text) => 
              setCurrentEntry(prev => prev ? { ...prev, content: text } : null)
            }
            multiline
            autoFocus
            textAlignVertical="top"
            placeholder="Write your thoughts..."
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#264653',
  },
  entriesContainer: {
    flex: 1,
    padding: 16,
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 16,
  },
  entryDate: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  entryPreview: {
    fontSize: 16,
    color: '#264653',
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2A9D8F',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  editorContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  editorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  editorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#264653',
  },
  editorActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editorButton: {
    padding: 8,
  },
  deleteButton: {
    marginRight: 8,
  },
  saveButton: {
    marginLeft: 8,
  },
  editor: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    color: '#264653',
  },
});
