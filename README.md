# THEMER

Browser-based FL Studio theme forge. Pick colors, drop a background, export a `.flstheme` zip.

**Live:** https://austnnnnnn.github.io/themer/

## Features

- 16 culture-driven presets (Cyberpunk, Hyper Light, Madoka, Pac-Man, Toxic, Vader, Gold Foil…)
- 6 color-harmony schemes (mono · analogous · complement · split · triadic · tetradic)
- Live FL Studio mock — channel rack, piano roll, playlist, mixer all repaint
- Drag-drop background image (rendered into theme + preview thumbnail)
- Per-key fine-tune (24 keys grouped: core / grids / meters / waveform)
- Global hue / sat / lightness post-tint
- Light-mode flag with live preview flip
- Auto-saves to localStorage — refresh keeps your work
- One-click `.zip` export ready to drop into FL Studio

## Run

Static site, no build step. Open `index.html` directly, or:

```
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy to GitHub Pages

1. Push to GitHub
2. Settings → Pages → source: `main` branch, root
3. Done. `.nojekyll` already present.

## Install a theme

1. Click **export .zip**
2. Unzip into `Documents/Image-Line/FL Studio/Settings/Themes/`
3. Restart FL Studio
4. Options → Theme settings → pick yours

## What it generates

`<ThemeName>/<themename>.flstheme` (INI text, signed BGR int colors)
`<ThemeName>/thm<themename>.jpg` (256×256 preview)
`<ThemeName>/bg.<ext>` (optional background image)

## Stack

Vanilla HTML/CSS/JS · JSZip via CDN · no build, no framework, no tracking.
