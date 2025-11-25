import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import WaveformView from './WaveformView';

export default function Timeline({ songs, fadeDuration, currentSongIndex, playbackState }) {
  const [globalZoom, setGlobalZoom] = useState(1);
  const [lastZoom, setLastZoom] = useState(1);

  const handlePinch = async (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      const newZoom = Math.max(0.5, Math.min(3, lastZoom * event.nativeEvent.scale));
      setGlobalZoom(newZoom);
    } else if (event.nativeEvent.state === State.END) {
      setLastZoom(globalZoom);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const zoomIn = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newZoom = Math.min(3, globalZoom + 0.25);
    setGlobalZoom(newZoom);
    setLastZoom(newZoom);
  };

  const zoomOut = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newZoom = Math.max(0.5, globalZoom - 0.25);
    setGlobalZoom(newZoom);
    setLastZoom(newZoom);
  };

  const resetZoom = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setGlobalZoom(1);
    setLastZoom(1);
  };

  if (songs.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Timeline will appear here once you add songs</Text>
      </View>
    );
  }

  const colors = ['#00ff88', '#00ccff', '#ff6b6b', '#ffd93d', '#a29bfe'];
  
  const totalDuration = songs.reduce((acc, song, index) => {
    if (index === 0) return song.duration;
    return acc + song.duration - fadeDuration;
  }, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Mix Timeline ({Math.floor(totalDuration / 60)}:{(totalDuration % 60).toFixed(0).padStart(2, '0')})
        </Text>
        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
            <Text style={styles.zoomButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.zoomLabel}>{globalZoom.toFixed(1)}x</Text>
          <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
            <Text style={styles.zoomButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetButton} onPress={resetZoom}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.subtitle}>👆 Tap +/− to zoom • Pinch with two fingers</Text>
      
      <PinchGestureHandler
        onGestureEvent={handlePinch}
        onHandlerStateChange={handlePinch}
      >
        <ScrollView 
          horizontal 
          style={styles.timeline}
          showsHorizontalScrollIndicator={false}
        >
          {songs.map((song, index) => {
            const isPlaying = index === currentSongIndex;
            const isMixing = playbackState.isCrossfading && 
                           (index === currentSongIndex || index === currentSongIndex + 1);
            const blockWidth = 280 * globalZoom;
            
            return (
              <View 
                key={song.id} 
                style={[
                  styles.timelineBlock,
                  { width: blockWidth },
                  isPlaying && styles.timelineBlockActive,
                  isMixing && styles.timelineBlockMixing,
                ]}
              >
                <View style={styles.blockHeader}>
                  <Text style={styles.blockNumber}>{index + 1}</Text>
                  {isMixing && <Text style={styles.mixingBadge}>🎛️ MIXING</Text>}
                </View>
                <Text style={styles.blockName} numberOfLines={1}>
                  {song.name.replace(/\.[^/.]+$/, '')}
                </Text>
                
                {/* Enhanced Waveform */}
                <View style={styles.waveformWrapper}>
                  <WaveformView
                    duration={song.duration}
                    currentTime={isPlaying ? playbackState.currentTime : 0}
                    color={colors[index % colors.length]}
                    height={80 * globalZoom}
                    zoomEnabled={false}
                    seed={song.id}
                    showProgress={isPlaying}
                  />
                </View>
                
                <View style={styles.blockFooter}>
                  <Text style={styles.blockDuration}>
                    {Math.floor(song.duration / 60)}:{(song.duration % 60).toFixed(0).padStart(2, '0')}
                  </Text>
                  <Text style={styles.blockBPM}>
                    {song.originalBPM.toFixed(0)} BPM
                  </Text>
                </View>
                
                {/* Crossfade Overlap Indicator */}
                {index < songs.length - 1 && (
                  <View style={styles.fadeIndicator}>
                    <Text style={styles.fadeText}>⟷ {fadeDuration}s overlap</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </PinchGestureHandler>

      <Text style={styles.hint}>
        Tracks overlap during transitions • Active tracks are highlighted
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#16213e',
    padding: 15,
    borderTopWidth: 2,
    borderTopColor: '#00ff88',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  title: {
    color: '#00ccff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  zoomButton: {
    backgroundColor: '#00ff88',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomButtonText: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  zoomLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#666',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#666',
    fontSize: 11,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  timeline: {
    height: 200,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 20,
  },
  timelineBlock: {
    backgroundColor: '#0f3460',
    padding: 12,
    borderRadius: 12,
    marginRight: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timelineBlockActive: {
    borderColor: '#00ff88',
    backgroundColor: '#16213e',
  },
  timelineBlockMixing: {
    borderColor: '#ff6b6b',
    backgroundColor: '#2a1a2e',
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  blockNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ff88',
  },
  mixingBadge: {
    fontSize: 10,
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  blockName: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 8,
    fontWeight: '600',
  },
  waveformWrapper: {
    marginBottom: 8,
  },
  blockFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blockDuration: {
    fontSize: 11,
    color: '#00ccff',
    fontFamily: 'monospace',
  },
  blockBPM: {
    fontSize: 11,
    color: '#00ff88',
    fontWeight: 'bold',
  },
  fadeIndicator: {
    position: 'absolute',
    right: -25,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  fadeText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: 'bold',
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  hint: {
    color: '#666',
    fontSize: 10,
    marginTop: 10,
    textAlign: 'center',
  },
});
