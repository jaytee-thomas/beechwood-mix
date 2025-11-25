import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function Timeline({ songs, fadeDuration, currentSongIndex }) {
  if (songs.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Timeline will appear here once you add songs</Text>
      </View>
    );
  }

  const colors = ['#00ff88', '#00ccff', '#ff6b6b', '#ffd93d', '#a29bfe'];
  
  // Calculate total mix duration
  const totalDuration = songs.reduce((acc, song, index) => {
    if (index === 0) return song.duration;
    return acc + song.duration - fadeDuration;
  }, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mix Timeline ({Math.floor(totalDuration / 60)}:{(totalDuration % 60).toFixed(0).padStart(2, '0')})</Text>
      
      <ScrollView 
        horizontal 
        style={styles.timeline}
        showsHorizontalScrollIndicator={false}
      >
        {songs.map((song, index) => {
          const width = (song.duration / totalDuration) * 600; // Scale for visibility
          const isPlaying = index === currentSongIndex;
          
          return (
            <View 
              key={song.id} 
              style={[
                styles.timelineBlock,
                { 
                  width: width,
                  backgroundColor: colors[index % colors.length],
                  opacity: isPlaying ? 1 : 0.6,
                  borderWidth: isPlaying ? 3 : 0,
                  borderColor: '#fff',
                }
              ]}
            >
              <Text style={styles.blockNumber}>{index + 1}</Text>
              <Text style={styles.blockDuration}>{Math.floor(song.duration)}s</Text>
              
              {index < songs.length - 1 && (
                <View style={styles.fadeIndicator}>
                  <Text style={styles.fadeText}>↔ {fadeDuration}s</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <Text style={styles.hint}>
        Each block represents a song. Overlaps show crossfade zones.
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
  title: {
    color: '#00ccff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  timeline: {
    height: 100,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 20,
  },
  timelineBlock: {
    height: 80,
    borderRadius: 10,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  blockNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  blockDuration: {
    fontSize: 12,
    color: '#000',
    fontWeight: '600',
  },
  fadeIndicator: {
    position: 'absolute',
    right: -15,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  fadeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    backgroundColor: '#e74c3c',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  hint: {
    color: '#666',
    fontSize: 11,
    marginTop: 10,
    textAlign: 'center',
  },
});

