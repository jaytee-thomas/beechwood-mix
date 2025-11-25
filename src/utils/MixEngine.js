import { Audio } from 'expo-av';

class MixEngine {
  constructor() {
    this.currentPlayer = null;
    this.nextPlayer = null;
    this.isCrossfading = false;
  }

  async initialize() {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      allowsRecordingIOS: false,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false,
    });
  }

  async loadSong(uri, targetBPM, originalBPM, startPosition = 0) {
    const playbackRate = targetBPM / originalBPM;
    
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      {
        shouldPlay: false,
        rate: playbackRate,
        shouldCorrectPitch: true,
        positionMillis: startPosition * 1000,
        volume: 1.0,
      }
    );

    return sound;
  }

  async startMix(songs, targetBPM, fadeDuration, onUpdate, onComplete) {
    if (songs.length === 0) return;

    let currentIndex = 0;

    // Load first song
    this.currentPlayer = await this.loadSong(
      songs[currentIndex].uri,
      targetBPM,
      songs[currentIndex].originalBPM
    );

    await this.currentPlayer.playAsync();

    // Monitor playback and handle transitions
    this.currentPlayer.setOnPlaybackStatusUpdate(async (status) => {
      if (!status.isLoaded) return;

      const currentTime = status.positionMillis / 1000;
      const duration = status.durationMillis / 1000;
      const timeRemaining = duration - currentTime;

      // Update callback
      if (onUpdate) {
        onUpdate({
          currentIndex,
          currentTime,
          duration,
          isCrossfading: this.isCrossfading,
        });
      }

      // Start crossfade when approaching end
      if (timeRemaining <= fadeDuration && !this.isCrossfading && currentIndex < songs.length - 1) {
        this.isCrossfading = true;
        await this.startCrossfade(songs, currentIndex + 1, targetBPM, fadeDuration);
      }

      // Song finished
      if (status.didJustFinish) {
        if (currentIndex < songs.length - 1) {
          // Move to next song
          if (this.currentPlayer) {
            await this.currentPlayer.unloadAsync();
          }
          this.currentPlayer = this.nextPlayer;
          this.nextPlayer = null;
          this.isCrossfading = false;
          currentIndex++;
        } else {
          // Mix complete
          await this.stop();
          if (onComplete) onComplete();
        }
      }
    });
  }

  async startCrossfade(songs, nextIndex, targetBPM, fadeDuration) {
    // Load next song
    this.nextPlayer = await this.loadSong(
      songs[nextIndex].uri,
      targetBPM,
      songs[nextIndex].originalBPM
    );

    // Start next song at low volume
    await this.nextPlayer.setVolumeAsync(0);
    await this.nextPlayer.playAsync();

    // Crossfade over fadeDuration seconds
    const steps = 20; // Number of volume steps
    const stepDuration = (fadeDuration * 1000) / steps;

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      
      // Fade out current
      if (this.currentPlayer) {
        await this.currentPlayer.setVolumeAsync(1 - progress);
      }
      
      // Fade in next
      if (this.nextPlayer) {
        await this.nextPlayer.setVolumeAsync(progress);
      }

      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
  }

  async pause() {
    if (this.currentPlayer) {
      await this.currentPlayer.pauseAsync();
    }
    if (this.nextPlayer) {
      await this.nextPlayer.pauseAsync();
    }
  }

  async resume() {
    if (this.currentPlayer) {
      await this.currentPlayer.playAsync();
    }
    if (this.nextPlayer) {
      await this.nextPlayer.playAsync();
    }
  }

  async stop() {
    if (this.currentPlayer) {
      await this.currentPlayer.stopAsync();
      await this.currentPlayer.unloadAsync();
      this.currentPlayer = null;
    }
    if (this.nextPlayer) {
      await this.nextPlayer.stopAsync();
      await this.nextPlayer.unloadAsync();
      this.nextPlayer = null;
    }
    this.isCrossfading = false;
  }

  async seek(position) {
    if (this.currentPlayer) {
      await this.currentPlayer.setPositionAsync(position * 1000);
    }
  }
}

export default new MixEngine();
