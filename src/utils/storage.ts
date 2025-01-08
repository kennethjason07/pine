import AsyncStorage from '@react-native-async-storage/async-storage';

export type MoodType = 'happy' | 'neutral' | 'sad';

export interface DayData {
  date: string;
  symptoms: string[];
  medication: boolean;
  mood: MoodType;
  notes?: string;
}

export const saveDayDetails = async (date: string, data: DayData) => {
  try {
    const key = `day_details_${date}`;
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving day details:', error);
  }
};

export const getDayDetails = async (date: string): Promise<DayData | null> => {
  try {
    const key = `day_details_${date}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting day details:', error);
    return null;
  }
};

export const getAllDayDetails = async (): Promise<{ [key: string]: DayData }> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const dayKeys = keys.filter(key => key.startsWith('day_details_'));
    const pairs = await AsyncStorage.multiGet(dayKeys);
    return pairs.reduce((acc: { [key: string]: DayData }, [key, value]) => {
      if (value) {
        const date = key.replace('day_details_', '');
        acc[date] = JSON.parse(value);
      }
      return acc;
    }, {});
  } catch (error) {
    console.error('Error getting all day details:', error);
    return {};
  }
}; 