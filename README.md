# 🌍 Earthquake Sonification Visualization

**Transform seismic data into immersive audio-visual experiences**

An interactive 3D globe that brings earthquake data to life through sound and stunning visual effects. Watch as real earthquake events unfold across the Earth's surface with curved shockwave animations, each accompanied by carefully mapped piano tones that reflect magnitude and depth.

![Earthquake Sonification Preview](https://img.shields.io/badge/Three.js-Interactive_3D-blue) ![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Sound_Mapping-green) ![Svelte](https://img.shields.io/badge/Svelte-Modern_UI-ff3e00)

## ✨ Features

### 🎵 **Audio Sonification**
- **Smart Sound Mapping**: Piano notes (C, E, G) mapped to earthquake magnitude
- **Depth-Based Octaves**: Higher octaves for shallow quakes, lower for deep ones
- **Real-time Audio**: Web Audio API with preloaded piano samples

### 🌐 **3D Visualization**
- **Interactive Globe**: Mouse-controlled 3D Earth with zoom and rotation
- **Curved Shockwaves**: Realistic surface-following earthquake ripples
- **Turquoise Color Scheme**: Magnitude-based color coding in beautiful cyan tones
- **Persistent Epicenters**: Small dots accumulate to show earthquake density hotspots

### 🎨 **Modern UI**
- **Glassmorphism Design**: Elegant translucent controls with backdrop blur
- **Dark Mode**: Sleek space-like aesthetic with animated gradients
- **IBM Typography**: Professional Plex Sans font family
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
3. **Control**: Adjust animation speed with the slider (10-500ms intervals)
4. **Explore**: Drag to rotate, scroll to zoom the 3D globe
5. **Listen**: Experience earthquakes as musical tones mapped to their properties
6. **Clear**: Remove accumulated epicenter dots with "Clear Epicenter Dots"

## 🎼 Sound Mapping System

| Magnitude Range | Musical Note | Depth Range | Octave |
|----------------|--------------|-------------|--------|
| > 6.2 (Major)  | **C** notes  | 0-10km     | 3-4    |
| 4.1 - 6.2 (Moderate) | **E** notes | 10-100km   | 2      |
| < 4.1 (Minor)  | **G** notes  | > 100km    | 1      |

## 🛠️ Built With

- **[Svelte](https://svelte.dev/)** - Reactive web framework
- **[Three.js](https://threejs.org/)** - 3D graphics library
- **[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)** - Audio processing
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Vite](https://vitejs.dev/)** - Fast build tool

## 👥 Team

Created by **Franz Anhäupl**, **Vivien Cai**, and **Rebeka Tot**

---

*Experience the Earth's seismic activity like never before – where science meets art through sound and motion.*
