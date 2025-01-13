import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Dimensions, Text } from 'react-native';
import { Video } from 'expo-av';

const Flowers: React.FC = () => {
  const [loading, setLoading] = useState(true); // State to track loading status
  const videoRef = React.useRef<Video>(null); // Reference for the video player

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={require('../called/flowers.mp4')} // Correct relative path to your local video file
        style={styles.video}
        resizeMode="cover"
        shouldPlay // Automatically start the video
        isLooping // Loop the video
        // isMuted // Mute the video
        onLoadStart={() => setLoading(true)} // Show loading indicator while loading
        onReadyForDisplay={() => setLoading(false)} // Hide loading indicator once loaded
        onError={(error) => console.error('Video error:', error)} // Log errors
      />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ff00" />
        </View>
      )}
      {!loading && (
        <View style={styles.textContainer}>
          <Text style={styles.text}>
            Flowers for <Text style={styles.highlight}>you Pineapple</Text>
          </Text>
        </View>
      )}
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', // Optional: White background for better contrast
  },
  video: {
    width: width / 2 + 600, // Adjusted width
    height: height / 2+80, // Adjusted height
    marginRight: 80,
  },
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  textContainer: {
    position: 'absolute',
    bottom: 50, // Position the text slightly above the bottom
    width: '100%',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'red',
    textAlign: 'center',
  },
  highlight: {
    color: 'green', // Highlight part of the text
  },
});

export default Flowers;