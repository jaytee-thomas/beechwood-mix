import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';

export default function SongList({ songs, addSong, removeSong, targetBPM }) {
  const pickSong = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        
        // Load audio to get duration
        const { sound } = await Audio.Sound.createAsync(
          { uri: file.uri },
          { shouldPlay: false }
        );
        
        const status = await sound.getStatusAsync();
        const durationSeconds = status.durationMillis / 1000;
        
        await sound.unloadAsync();

        addSong({
          name: file.name,
          uri: file.uri,
          duration: durationSeconds,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load audio file');
      console.error(error);
    }
  };

  const calculateSyncedDuration = (originalBPM, duration) => {
    const playbackRate = targetBPM / originalBPM;
    return duration / playbackRate;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Tracks ({songs.length})</Text>
        <TouchableOpacity style={styles.addButton} onPress={pickSong}>
          <Text style={styles.addButtonText}>+ Add Song</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.songList} showsVerticalScrollIndicator={false}>
        {songs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No songs yet</Text>
            <Text style={styles.emptySubtext}>Tap "+ Add Song" to get started</Text>
          </View>
        ) : (
          songs.map((song, index) => {
            const syncedDuration = calculateSyncedDuration(song.originalBPM, song.duration);
            return (
              <View key={song.id} style={styles.songItem}>
                <View style={styles.songInfo}>
                  <Text style={styles.songNumber}>{index + 1}</Text>
                  <View style={styles.songDetails}>
                    <Text style={styles.songName} numberOfLines={1}>
                      {song.name}
                    </Text>
                    <Text style={styles.songMeta}>
                      {song.originalBPM.toFixed(0)} BPM → {targetBPM} BPM | {syncedDuration.toFixed(0)}s
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeSong(song.id)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f3460',
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#00ff88',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  songList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginBottom: 5,
  },
  emptySubtext: {
    color: '#444',
    fontSize: 12,
  },
  songItem: {
    backgroundColor: '#16213e',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#00ff88',
  },
  songInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  songNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ccff',
    marginRight: 15,
    width: 30,
  },
  songDetails: {
    flex: 1,
  },
  songName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  songMeta: {
    color: '#00ff88',
    fontSize: 12,
  },
  removeButton: {
    backgroundColor: '#e74c3c',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

