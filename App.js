import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import Header from './src/components/Header';
import SongList from './src/components/SongList';
import Timeline from './src/components/Timeline';
import Controls from './src/components/Controls';

export default function App() {
  const [songs, setSongs] = useState([]);
  const [targetBPM, setTargetBPM] = useState(128);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [fadeDuration, setFadeDuration] = useState(8); // seconds

  const addSong = (newSong) => {
    setSongs([...songs, {
      ...newSong,
      id: Date.now(),
      originalBPM: 120 + Math.random() * 40, // Mock BPM detection
      startTime: songs.length === 0 ? 0 : songs[songs.length - 1].startTime + songs[songs.length - 1].duration - fadeDuration,
      duration: newSong.duration,
    }]);
  };

  const removeSong = (id) => {
    setSongs(songs.filter(song => song.id !== id));
  };

  const updateSongStartTime = (id, newStartTime) => {
    setSongs(songs.map(song => 
      song.id === id ? { ...song, startTime: newStartTime } : song
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <Header 
        targetBPM={targetBPM}
        setTargetBPM={setTargetBPM}
        fadeDuration={fadeDuration}
        setFadeDuration={setFadeDuration}
      />

      <SongList 
        songs={songs}
        addSong={addSong}
        removeSong={removeSong}
        targetBPM={targetBPM}
      />

      <Timeline 
        songs={songs}
        updateSongStartTime={updateSongStartTime}
        fadeDuration={fadeDuration}
        currentSongIndex={currentSongIndex}
      />

      <Controls 
        songs={songs}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        currentSongIndex={currentSongIndex}
        setCurrentSongIndex={setCurrentSongIndex}
        targetBPM={targetBPM}
        fadeDuration={fadeDuration}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
});

