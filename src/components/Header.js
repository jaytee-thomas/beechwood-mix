import React, { useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function Header({ targetBPM, setTargetBPM, fadeDuration, setFadeDuration }) {
  const bpmInputRef = useRef(null);
  const fadeInputRef = useRef(null);

  const handleBPMChange = async (text) => {
    const value = parseInt(text) || 128;
    const newValue = Math.max(60, Math.min(200, value));
    setTargetBPM(newValue);
    
    if (text && newValue !== targetBPM) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const adjustBPM = async (delta) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = Math.max(60, Math.min(200, targetBPM + delta));
    setTargetBPM(newValue);
  };

  const handleFadeChange = async (text) => {
    const value = parseInt(text) || 8;
    const newValue = Math.max(2, Math.min(20, value));
    setFadeDuration(newValue);
    
    if (text && newValue !== fadeDuration) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const adjustFade = async (delta) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = Math.max(2, Math.min(20, fadeDuration + delta));
    setFadeDuration(newValue);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎧 Beechwood Mix</Text>
      <Text style={styles.subtitle}>Create Your Perfect Mix</Text>
      
      <View style={styles.controls}>
        {/* BPM Control */}
        <View style={styles.controlGroup}>
          <Text style={styles.label}>Target BPM</Text>
          <View style={styles.inputContainer}>
            <TouchableOpacity 
              style={styles.adjustButton}
              onPress={() => adjustBPM(-5)}
            >
              <Text style={styles.adjustButtonText}>−</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.inputWrapper}
              onPress={() => bpmInputRef.current?.focus()}
              activeOpacity={0.7}
            >
              <TextInput
                ref={bpmInputRef}
                style={styles.input}
                value={targetBPM.toString()}
                onChangeText={handleBPMChange}
                keyboardType="numeric"
                selectTextOnFocus
                maxLength={3}
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.adjustButton}
              onPress={() => adjustBPM(5)}
            >
              <Text style={styles.adjustButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.range}>60-200</Text>
        </View>

        {/* Fade Control */}
        <View style={styles.controlGroup}>
          <Text style={styles.label}>Fade (sec)</Text>
          <View style={styles.inputContainer}>
            <TouchableOpacity 
              style={styles.adjustButton}
              onPress={() => adjustFade(-1)}
            >
              <Text style={styles.adjustButtonText}>−</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.inputWrapper}
              onPress={() => fadeInputRef.current?.focus()}
              activeOpacity={0.7}
            >
              <TextInput
                ref={fadeInputRef}
                style={styles.input}
                value={fadeDuration.toString()}
                onChangeText={handleFadeChange}
                keyboardType="numeric"
                selectTextOnFocus
                maxLength={2}
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.adjustButton}
              onPress={() => adjustFade(1)}
            >
              <Text style={styles.adjustButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.range}>2-20</Text>
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
    marginBottom: 8,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adjustButton: {
    backgroundColor: '#00ff88',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustButtonText: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  inputWrapper: {
    backgroundColor: '#0f3460',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#00ff88',
  },
  input: {
    color: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: 70,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
  },
  range: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
});
