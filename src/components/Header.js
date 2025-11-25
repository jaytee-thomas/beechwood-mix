import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';

export default function Header({ targetBPM, setTargetBPM, fadeDuration, setFadeDuration }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎧 Beechwood Mix</Text>
      <Text style={styles.subtitle}>Create Your Perfect Mix</Text>
      
      <View style={styles.controls}>
        <View style={styles.controlGroup}>
          <Text style={styles.label}>Target BPM</Text>
          <TextInput
            style={styles.input}
            value={targetBPM.toString()}
            onChangeText={(text) => {
              const value = parseInt(text) || 128;
              setTargetBPM(Math.max(60, Math.min(200, value)));
            }}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.controlGroup}>
          <Text style={styles.label}>Fade (sec)</Text>
          <TextInput
            style={styles.input}
            value={fadeDuration.toString()}
            onChangeText={(text) => {
              const value = parseInt(text) || 8;
              setFadeDuration(Math.max(2, Math.min(20, value)));
            }}
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#16213e',
    borderBottomWidth: 2,
    borderBottomColor: '#00ff88',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00ff88',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 15,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  controlGroup: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#00ccff',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#0f3460',
    color: '#fff',
    padding: 10,
    borderRadius: 10,
    width: 80,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    borderWidth: 2,
    borderColor: '#00ff88',
  },
});

