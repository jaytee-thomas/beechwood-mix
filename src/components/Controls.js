import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

export default function Controls({ 
  songs, 
  isPlaying, 
  setIsPlaying, 
  currentSongIndex,
  setCurrentSongIndex,
  targetBPM,
  fadeDuration 
}) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const soundRef = useRef(null);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playMix = async () => {
    if (songs.length === 0) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('No Songs', 'Please add songs to your mix first');
      return;
    }

    // Heavy haptic for main action
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsLoading(true);

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const song = songs[currentSongIndex];
      const playbackRate = targetBPM / song.originalBPM;

      const { sound } = await Audio.Sound.createAsync(
        { uri: song.uri },
        { 
          shouldPlay: true,
          rate: playbackRate,
          shouldCorrectPitch: true,
        }
      );

      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setCurrentTime(status.positionMillis / 1000);
          setDuration(status.durationMillis / 1000);

          if (status.didJustFinish) {
            if (currentSongIndex < songs.length - 1) {
              setCurrentSongIndex(currentSongIndex + 1);
              playMix();
            } else {
              setIsPlaying(false);
              setCurrentSongIndex(0);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          }
        }
      });

      setIsPlaying(true);
      // Success haptic
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Error haptic
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Playback Error', 'Could not play audio');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const pauseMix = async () => {
    // Medium haptic
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    }
  };

  const stopMix = async () => {
    // Heavy haptic for destructive action
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setIsPlaying(false);
    setCurrentSongIndex(0);
    setCurrentTime(0);
    
    // Light success haptic
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {songs.length > 0 && (
        <View style={styles.nowPlaying}>
          <Text style={styles.nowPlayingLabel}>Now Playing:</Text>
          <Text style={styles.songName} numberOfLines={1}>
            {songs[currentSongIndex]?.name || 'No song'}
          </Text>
          <Text style={styles.timeDisplay}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Text>
        </View>
      )}

      <View style={styles.buttons}>
        {!isPlaying ? (
          <TouchableOpacity 
            style={[styles.button, styles.playButton, isLoading && styles.buttonDisabled]}
            onPress={playMix}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>▶ Play Mix</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.button, styles.pauseButton]}
            onPress={pauseMix}
          >
            <Text style={styles.buttonText}>⏸ Pause</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.button, styles.stopButton]}
          onPress={stopMix}
        >
          <Text style={styles.buttonText}>⏹ Stop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f3460',
    padding: 20,
    borderTopWidth: 2,
    borderTopColor: '#00ff88',
  },
  nowPlaying: {
    marginBottom: 15,
    alignItems: 'center',
  },
  nowPlayingLabel: {
    color: '#00ccff',
    fontSize: 12,
    marginBottom: 5,
  },
  songName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  timeDisplay: {
    color: '#00ff88',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 25,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  playButton: {
    backgroundColor: '#00ff88',
  },
  pauseButton: {
    backgroundColor: '#ff6b6b',
  },
  stopButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});
