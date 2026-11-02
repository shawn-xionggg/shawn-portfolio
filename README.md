# Shawn Xiong — Portfolio

A personal portfolio with spacious typography, a midnight-blue default theme, and a small interactive guitar. Light mode switches to warm paper, an acoustic illustration, and clean acoustic-style chords.

## Local development

Use Node.js 22.12+ and npm:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://127.0.0.1:5173/). If that port is occupied, Vite automatically uses the next available port. Use the development server instead of opening `index.html` directly.

```sh
npm run build
npm run preview
```

Publish the contents of `dist/` to a static host. The build includes the résumé PDF and uses relative asset URLs. React and Agentation are development tools and are excluded from the production bundle. IBM Plex Sans loads from Google Fonts, with a system-font fallback.

## Visual feedback

The Agentation toolbar appears at the bottom right in development. Activate it, select an element, write a comment, and choose **Copy feedback**. Paste the result into the coding chat. Feedback remains in the browser until you copy and share it; there is no MCP endpoint or live agent connection.

## Files

- `index.html`: content, project links, native build notes, and both guitar SVGs.
- `styles.css`: responsive grid, themes, typography, and small transitions.
- `app.js`: theme switching, synthesized chords, cursor pick, and Easter eggs.
- `dev-toolbar.jsx`: development-only Agentation mount in manual copy mode.
- `vite.config.js`: local server and production résumé asset.
- `shawn-xiong-resume.pdf`: the linked résumé.

## Small discoveries

- Click the period after Shawn's name for a brief burst of music notes.
- Tap the guitar to play. Dark mode cycles G5, D5, E5, and C5 through a high-gain preamp, distortion, and cabinet filter; light mode cycles G, D, Em, and C through a clean channel.
- Strum four times for a small message.
- Hover or focus within a project to wake up its drawing.
- Type `encore` to toggle the after-hours palette; Escape restores the normal accents and stops sound.
- The footer's `psst…` button offers hints and eventually toggles after-hours mode for touch users.

Sound is enabled by default, but audio only starts after a guitar click or tap. Use the Sound on/off button to mute it. Audio is synthesized locally; it stops when the tab is hidden or loses focus. The glowing pick and soft dark-mode halo accompany the native cursor, never capture clicks, and stop rendering when settled. They hide for touch and keyboard navigation.

Animations respect reduced motion. The chosen theme persists locally and is applied before CSS loads. Content and native project disclosures remain usable without JavaScript.
