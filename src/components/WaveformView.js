import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Line, Rect } from 'react-native-svg';

// Generate realistic waveform data
const generateWaveform = (points = 150, seed = 0) => {
  const data = [];
  for (let i = 0; i < points; i++) {
    const x = i / points;
    // Multiple sine waves for realistic audio look
    const wave1 = Math.sin(x * 20 + seed) * 0.3;
    const wave2 = Math.sin(x * 50 + seed * 2) * 0.2;
    const wave3 = Math.sin(x * 100 + seed * 3) * 0.1;
    const wave4 = Math.sin(x * 200 + seed * 4) * 0.05;
    const noise = (Math.random() - 0.5) * 0.15;
    const amplitude = Math.abs(wave1 + wave2 + wave3 + wave4 + noise);
    data.push(Math.min(1, amplitude * 1.2)); // Scale and cap
  }
  return data;
};

export default function WaveformView({ 
  duration = 0, 
  color = '#00ff88', 
  height = 80, 
  currentTime = 0,
  zoomEnabled = true,
  seed = 0,
  showProgress = true,
}) {
  const waveformData = generateWaveform(150, seed);
  const width = 300;

  // Convert waveform data to SVG path
  const createWaveformPath = () => {
    const heightCenter = height / 2;
    const barWidth = width / waveformData.length;

    let pathData = '';
    waveformData.forEach((amplitude, index) => {
      const x = index * barWidth;
      const barHeight = amplitude * heightCenter * 0.85;
      
      // Create vertical bar
      pathData += `M ${x} ${heightCenter - barHeight} `;
      pathData += `L ${x} ${heightCenter + barHeight} `;
    });

    return pathData;
  };

  // Calculate progress indicator position
  const progressPosition = showProgress && currentTime && duration 
    ? (currentTime / duration) * width 
    : 0;

  return (
    <View style={[styles.container, { height, width }]}>
      <Svg width={width} height={height}>
        {/* Background */}
        <Rect x={0} y={0} width={width} height={height} fill="rgba(0, 0, 0, 0.3)" />
        
        {/* Played portion (dimmed) */}
        {showProgress && progressPosition > 0 && (
          <Rect 
            x={0} 
            y={0} 
            width={progressPosition} 
            height={height} 
            fill="rgba(0, 0, 0, 0.3)" 
          />
        )}
        
        {/* Waveform bars */}
        <Path
          d={createWaveformPath()}
          stroke={color}
          strokeWidth={2.5}
          strokeOpacity={0.9}
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Progress indicator line */}
        {showProgress && progressPosition > 0 && (
          <Line
            x1={progressPosition}
            y1={0}
            x2={progressPosition}
            y2={height}
            stroke="#ffffff"
            strokeWidth={3}
            strokeOpacity={0.9}
          />
        )}
      </Svg>
      
      {zoomEnabled && (
        <View style={styles.zoomHint}>
          <View style={styles.zoomIndicator} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  zoomHint: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  zoomIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
});
