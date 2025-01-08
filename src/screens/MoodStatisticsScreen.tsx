import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { getAllDayDetails, DayData } from '../utils/storage';
import { format, subDays, parseISO } from 'date-fns';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  MoodStatistics: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export default function MoodStatisticsScreen({ navigation }: Props) {
  const [moodData, setMoodData] = useState<{[key: string]: number}>({
    happy: 0,
    neutral: 0,
    sad: 0
  });
  const [recentMoods, setRecentMoods] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMoodData();
  }, []);

  const loadMoodData = async () => {
    try {
      setIsLoading(true);
      const allData = await getAllDayDetails();
      
      // Calculate mood frequencies
      const moodCounts = Object.values(allData).reduce((acc, day) => {
        if (day.mood) {
          acc[day.mood] = (acc[day.mood] || 0) + 1;
        }
        return acc;
      }, {} as {[key: string]: number});

      setMoodData(moodCounts);

      // Get recent moods (last 7 days)
      const sortedData = Object.values(allData)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 7);
      setRecentMoods(sortedData);
    } catch (error) {
      console.error('Error loading mood data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'neutral': return '😐';
      case 'sad': return '😔';
      default: return '😐';
    }
  };

  const getTotalEntries = () => {
    return Object.values(moodData).reduce((a, b) => a + b, 0);
  };

  const getPercentage = (count: number) => {
    const total = getTotalEntries();
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  const getMoodValue = (mood: string) => {
    switch (mood) {
      case 'happy': return 3;
      case 'neutral': return 2;
      case 'sad': return 1;
      default: return 0;
    }
  };

  const getChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return format(date, 'yyyy-MM-dd');
    });

    const moodValues = last7Days.map(date => {
      const dayData = recentMoods.find(d => 
        format(new Date(d.date), 'yyyy-MM-dd') === date
      );
      return dayData ? getMoodValue(dayData.mood) : 0;
    });

    return {
      labels: last7Days.map(date => format(parseISO(date), 'MM/dd')),
      datasets: [{
        data: moodValues
      }]
    };
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
        <Text style={styles.title}>Mood Statistics</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Mood Graph */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Mood Trends</Text>
          <View style={styles.chartContainer}>
            {!isLoading && (
              <LineChart
                data={getChartData()}
                width={Dimensions.get('window').width - 64}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                yAxisInterval={1}
                chartConfig={{
                  backgroundColor: '#FFFFFF',
                  backgroundGradientFrom: '#FFFFFF',
                  backgroundGradientTo: '#FFFFFF',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(42, 157, 143, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(38, 70, 83, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#2A9D8F"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
                fromZero
                segments={2}
                formatYLabel={(value) => {
                  switch (parseInt(value)) {
                    case 3: return 'Happy';
                    case 2: return 'Neutral';
                    case 1: return 'Sad';
                    default: return '';
                  }
                }}
              />
            )}
          </View>
          <View style={styles.legendContainer}>
            <Text style={styles.legendText}>Past 7 Days Mood Trend</Text>
          </View>
        </View>

        {/* Overall Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Mood Distribution</Text>
          <View style={styles.moodStats}>
            {Object.entries(moodData).map(([mood, count]) => (
              <View key={mood} style={styles.moodStat}>
                <Text style={styles.moodEmoji}>{getMoodIcon(mood)}</Text>
                <Text style={styles.moodCount}>{count}</Text>
                <Text style={styles.moodPercentage}>{getPercentage(count)}%</Text>
                <Text style={styles.moodLabel}>{mood}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Moods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Moods</Text>
          {recentMoods.map((day, index) => (
            <View key={index} style={styles.recentMoodItem}>
              <View style={styles.dateContainer}>
                <Text style={styles.dateText}>
                  {format(new Date(day.date), 'MMM d, yyyy')}
                </Text>
              </View>
              <View style={styles.moodContainer}>
                <Text style={styles.moodEmoji}>{getMoodIcon(day.mood)}</Text>
                <Text style={styles.moodText}>{day.mood}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#264653',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#264653',
    marginBottom: 16,
  },
  moodStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  moodStat: {
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#264653',
  },
  moodPercentage: {
    fontSize: 16,
    color: '#2A9D8F',
    marginTop: 4,
  },
  moodLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  recentMoodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    color: '#264653',
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
  },
  legendContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  dataPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2A9D8F',
  },
  chart: {
    height: 220,
    width: Dimensions.get('window').width - 64,
  },
}); 