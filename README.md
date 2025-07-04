# 🌍 Earthquake Sonification Visualization

**Transform seismic data into immersive audio-visual experiences**

An interactive 3D globe that brings earthquake data to life through sound and stunning visual effects. Watch as real earthquake events unfold across the Earth's surface with curved shockwave animations, each accompanied by carefully mapped instrumental sounds that reflect magnitude and depth.

![Earthquake Sonification Preview](https://img.shields.io/badge/Three.js-Interactive_3D-blue) ![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Sound_Mapping-green) ![Svelte](https://img.shields.io/badge/Svelte-Modern_UI-ff3e00)

## ✨ Features

### 🎵 **Audio Sonification**
- **Multi-Instrument Mapping**: Violin (shallow), Piano (medium), Accordion (deep) mapped by earthquake depth
- **Alternative Instruments**: Toggle to Clarinet, Saxophone, Brass Ensemble for variety
- **Magnitude-Based Pitch**: Higher magnitudes produce higher/louder tones
- **Catastrophic Events**: Special percussion/gong sounds for magnitude 8+ earthquakes
- **Stereo Panning**: Immersive spatial audio - left earthquakes in left speaker, right in right speaker
- **Real-time Audio**: Web Audio API with preloaded instrument samples

### 🌐 **3D Visualization**
- **Interactive Globe**: Mouse-controlled 3D Earth with zoom and rotation
- **Curved Shockwaves**: Realistic surface-following earthquake ripples with depth-based layering
- **Depth-Based Colors**: Blue (shallow), Red (medium), Orange (deep), Cream (catastrophic)
- **Multiple Globe Layers**: Visual depth representation with 3 concentric spheres
- **Persistent Epicenters**: Small dots accumulate to show earthquake density hotspots
- **Country Borders**: Subtle geographical reference overlay

### 🎨 **Modern UI**
- **Glassmorphism Design**: Elegant translucent controls with backdrop blur
- **Dark Mode**: Sleek space-like aesthetic with animated gradients
- **IBM Typography**: Professional Plex Sans and Plex Mono font families
- **Comprehensive Control Panel**: Instrument toggles, speed control, timeline navigation
- **Responsive Layout**: Works seamlessly on desktop and mobile

### ⚡ **Performance Optimized**
- **Frame Limiting**: Smooth 60 FPS with efficient rendering
- **Audio Preloading**: Instant sound playback without delays
- **Shared Geometry**: Memory-efficient 3D object reuse
- **Smart Disposal**: Proper cleanup prevents memory leaks

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:5173
```

## 🎮 How to Use

1. **Navigate**: Click "Enter Visualization" on the landing page
2. **Play**: Hit "Play Sonification" to start the earthquake sequence
3. **Control Panel**: Open the left sidebar to access all controls
4. **Timeline**: Use the year slider to jump to specific years (2010-2016)
5. **Instruments**: Toggle individual instruments or switch to alternative sounds
7. **Speed**: Adjust animation speed with the slider (10-500ms intervals)
8. **Explore**: Drag to rotate, scroll to zoom the 3D globe
9. **Listen**: Experience earthquakes as musical tones mapped to their properties
10. **Clear**: Remove accumulated epicenter dots with "Clear Epicenter Dots"

## 🎼 Sound Mapping System

### Primary Instruments by Depth
| Depth Range | Default Instrument | Alternative | Color Scheme |
|-------------|-------------------|-------------|--------------|
| **0-30km** (Shallow) | 🎻 **Violin** | 🎷 **Clarinet** | Blue tones |
| **30-100km** (Medium) | 🎹 **Piano** | 🎺 **Saxophone** | Red tones |
| **>100km** (Deep) | 🪗 **Accordion** | 🎺 **Brass Ensemble** | Orange tones |

### Special Events
| Event Type | Sound | Trigger |
|------------|-------|---------|
| **Catastrophic** | 🥁 **Percussion** / 🔔 **Gong** | Magnitude ≥ 8.0 |

### Magnitude to Pitch Mapping
- **Higher Magnitude** → **Higher Pitch** + **Louder Volume**
- **Lower Magnitude** → **Lower Pitch** + **Quieter Volume**
- **Range**: Magnitude 5.5-7.5+ mapped to instrument-specific note ranges
- **Tone Distribution**: 6 distinct tones per instrument, mapped in 0.5 magnitude increments:
  - **5.5**: Highest tone 
  - **7.5+**: Lowest tone

## 🛠️ Built With

- **[Svelte](https://svelte.dev/)** - Reactive web framework with component-based architecture
- **[Three.js](https://threejs.org/)** - 3D graphics library for WebGL rendering
- **[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)** - Audio processing
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Vite](https://vitejs.dev/)** - Fast build tool and development server

## 📊 Dataset

- **Time Period**: 2010-2016 earthquake data
- **Geographic Coverage**: Global seismic events
- **Data Points**: Latitude, Longitude, Magnitude, Depth, Timestamp
- **Filtering**: Magnitude 5.5+ for meaningful sonification

## 👥 Team

Created by **Franz Anhäupl**, **Vivien Cai**, and **Rebeka Tot**

---

*Experience the Earth's seismic activity like never before – where science meets art through sound and motion.*
