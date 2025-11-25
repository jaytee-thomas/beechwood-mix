import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Header from './src/components/Header';
import SongList from './src/components/SongList';
import Timeline from './src/components/Timeline';
import Controls from './src/components/Controls';

export default function App() {
  const [songs, setSongs] = useState([]);
  const [targetBPM, setTargetBPM] = useState(128);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [fadeDuration, setFadeDuration] = useState(8);
  const [playbackState, setPlaybackState] = useState({
    currentTime: 0,
    duration: 0,
    isCrossfading: false,
  });

  const addSong = (newSong) => {
    const previousSong = songs.length > 0 ? songs[songs.length - 1] : null;
    const startTime = previousSong 
      ? previousSong.startTime + previousSong.duration - fadeDuration
      : 0;

    setSongs([...songs, {
      ...newSong,
      id: Date.now(),
      originalBPM: 120 + Math.random() * 40,
      startTime: Math.max(0, startTime),
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
            playbackState={playbackState}
          />

          <Controls 
            songs={songs}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            currentSongIndex={currentSongIndex}
            setCurrentSongIndex={setCurrentSongIndex}
            targetBPM={targetBPM}
            fadeDuration={fadeDuration}
            playbackState={playbackState}
            setPlaybackState={setPlaybackState}
          />
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
