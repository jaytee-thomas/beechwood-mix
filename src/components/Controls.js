import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import MixEngine from '../utils/MixEngine';
import WaveformView from './WaveformView';

export default function Controls({ 
  songs, 
  isPlaying, 
  setIsPlaying, 
  currentSongIndex,
  setCurrentSongIndex,
  targetBPM,
  fadeDuration,
  playbackState,
  setPlaybackState,
}) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    MixEngine.initialize();
    return () => {
      MixEngine.stop();
    };
  }, []);

  const playMix = async () => {
    if (songs.length === 0) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('No Songs', 'Please add songs to your mix first');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsLoading(true);

    try {
      await MixEngine.startMix(
        songs,
        targetBPM,
        fadeDuration,
        (state) => {
          setPlaybackState(state);
          setCurrentSongIndex(state.currentIndex);
        },
        () => {
          setIsPlaying(false);
          setCurrentSongIndex(0);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      );

      setIsPlaying(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Playback Error', 'Could not play mix');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const pauseMix = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await MixEngine.pause();
    setIsPlaying(false);
  };

  const resumeMix = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await MixEngine.resume();
    setIsPlaying(true);
  };

  const stopMix = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await MixEngine.stop();
    setIsPlaying(false);
    setCurrentSongIndex(0);
    setPlaybackState({ currentTime: 0, duration: 0, isCrossfading: false });
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSeek = async (direction) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const seekAmount = direction === 'forward' ? 10 : -10;
    const newPosition = Math.max(0, Math.min(playbackState.duration, playbackState.currentTime + seekAmount));
    await MixEngine.seek(newPosition);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSong = songs[currentSongIndex];
  const progress = playbackState.duration > 0 
    ? (playbackState.currentTime / playbackState.duration) * 100 
    : 0;

  return (
    <View style={styles.container}>
      {songs.length > 0 && (
        <>
          <View style={styles.nowPlaying}>
            <Text style={styles.nowPlayingLabel}>
              {playbackState.isCrossfading ? '🎛️ MIXING TRACKS' : 'Now Playing:'}
            </Text>
            <Text style={styles.songName} numberOfLines={1}>
              {currentSong?.name || 'No song'}
            </Text>
            {playbackState.isCrossfading && songs[currentSongIndex + 1] && (
              <Text style={styles.nextSong} numberOfLines={1}>
                ↓ Blending into: {songs[currentSongIndex + 1].name}
              </Text>
            )}
          </View>

          {/* Waveform Visualization */}
          <View style={styles.waveformContainer}>
            <WaveformView
              duration={playbackState.duration}
              currentTime={playbackState.currentTime}
              color={playbackState.isCrossfading ? '#ff6b6b' : '#00ff88'}
              height={100}
              zoomEnabled={true}
              seed={currentSongIndex}
            />
          </View>

          {/* Time Display and Progress Bar */}
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(playbackState.currentTime)}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.timeText}>{formatTime(playbackState.duration)}</Text>
          </View>

          {/* Seek Buttons */}
          <View style={styles.seekButtons}>
            <TouchableOpacity 
              style={styles.seekButton}
              onPress={() => handleSeek('backward')}
              disabled={!isPlaying}
            >
              <Text style={styles.seekButtonText}>⏪ 10s</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.seekButton}
              onPress={() => handleSeek('forward')}
              disabled={!isPlaying}
            >
              <Text style={styles.seekButtonText}>10s ⏩</Text>
            </TouchableOpacity>
          </View>
        </>
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

      {songs.length > 0 && (
        <Text style={styles.hint}>
          💡 Songs will automatically blend together at {targetBPM} BPM
        </Text>
      )}
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
    fontWeight: 'bold',
  },
  songName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  nextSong: {
    color: '#ff6b6b',
    fontSize: 14,
    fontStyle: 'italic',
  },
  waveformContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  timeText: {
    color: '#00ff88',
    fontSize: 12,
    fontFamily: 'monospace',
    minWidth: 40,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#1a1a2e',
    borderRadius: 3,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ff88',
    borderRadius: 3,
  },
  seekButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 15,
  },
  seekButton: {
    backgroundColor: '#16213e',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00ccff',
  },
  seekerButtonDisabled: {
    opacity: 0.5,
  },
  seekButtonText: {
    color: '#00ccff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
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
  hint: {
    textAlign: 'center',
    color: '#666',
    fontSize: 11,
    fontStyle: 'italic',
  },
});
