# Vikas Patel Portfolio

A personal portfolio website built with React and Vite for showcasing my profile, skills, education, certifications, projects, and contact details.

## Tech Stack

- React
- Vite
- CSS
- Lucide React icons

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev -- --host 0.0.0.0
   ```
3. Open the local URL shown in the terminal, usually:
   ```bash
   http://localhost:5173/
   ```

## Build for Production

```bash
npm run build
```

## Talking Avatar

The hero attempts to start the spoken introduction shortly after the page opens, with play/pause, replay, stop, mute, motion controls, a readable transcript, and an animated mouth overlay on the profile photo. Browsers that block unprompted speech show a reminder to start it with the Play control. Without extra assets, the browser's available English speech voice and the existing profile photo are used.

For a rigged 3D avatar and a dedicated generated voice, copy `.env.example` to `.env.local`, place the assets in `public/`, and set:

- `VITE_AVATAR_MODEL_URL=/avatar.glb` to a GLB/GLTF model with a humanoid rig. Idle and gesture clips named with terms such as `idle`, `talk`, `wave`, `gesture`, or `point` are played when available. Mouth movement uses common `mouthOpen`, `jawOpen`, or `viseme` blend-shape names when provided.
- `VITE_INTRO_AUDIO_URL=/introduction.mp3` to an audio recording generated from the displayed introduction. The avatar uses the audio waveform for mouth movement. Keep the voice file in sync with the transcript.

The model renderer and Three.js are loaded only when a model URL is configured and the hero approaches the viewport. The model remains optional; if WebGL is unavailable or a model fails to load, the profile photo and speech controls remain available. Browser speech voice availability and quality depend on the visitor's device. These variables are public asset URLs, not API keys; do not put service credentials in `VITE_*` variables.

## Project Structure

```bash
src/
  App.jsx
  TalkingAvatarExperience.jsx
  TalkingAvatar.jsx
  main.jsx
  index.css
public/
```

## Author

Vikas Patel KR

## Purpose

This portfolio highlights my academic journey, technical strengths, and software engineering interests for recruiters and collaborators.
