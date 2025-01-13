import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import Video from 'react-native-video';

const Flowers: React.FC = () => {
  const [loading, setLoading] = useState(true); // State to track loading status

  return (
    <View style={styles.container}>
      <Video
        source={require('../assets/flowers.mp4')} // Path to the video file
        style={styles.video}
        resizeMode="cover"
        repeat
        muted
        onError={(error) => console.error('Video Error:', error)} // Log any errors
        onLoadStart={() => setLoading(true)} // Show loading indicator
        onLoad={() => setLoading(false)} // Hide loading indicator
      />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ff00" />
        </View>
      )}
    </View>
  );
};

const { width, height } = Dimensions.get('window'); // Get device dimensions

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000', // Optional: Set background color for better contrast
  },
  video: {
    width: width, // Dynamic width
    height: height, // Dynamic height
  },
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional: Add transparency while loading
  },
});

export default Flowers;
