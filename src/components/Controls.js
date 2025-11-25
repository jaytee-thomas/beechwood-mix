import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
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
      Alert.alert('No Songs', 'Please add songs to your mix first');
      return;
    }

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
          shouldCorrectPitch: true, // Keep pitch the same
        }
      );

      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setCurrentTime(status.positionMillis / 1000);
          setDuration(status.durationMillis / 1000);

          // Auto-advance to next song
          if (status.didJustFinish) {
            if (currentSongIndex < songs.length - 1) {
              setCurrentSongIndex(currentSongIndex + 1);
              playMix();
            } else {
              setIsPlaying(false);
              setCurrentSongIndex(0);
            }
          }
        }
      });

      setIsPlaying(true);
    } catch (error) {
      Alert.alert('Playback Error', 'Could not play audio');
      console.error(error);
    }
  };

  const pauseMix = async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    }
  };

  const stopMix = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setIsPlaying(false);
    setCurrentSongIndex(0);
    setCurrentTime(0);
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
            style={[styles.button, styles.playButton]}
            onPress={playMix}
          >
            <Text style={styles.buttonText}>▶ Play Mix</Text>
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

