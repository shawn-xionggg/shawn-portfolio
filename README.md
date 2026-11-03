# Shawn Xiong — Portfolio

A personal portfolio with spacious typography, a midnight-blue palette, and an interactive electric guitar and amplifier. It starts unplugged with a quiet clean tone. Drag the cable plug into the amplifier for distortion; pull it out to go clean again.

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

- `index.html`: content, project links, native build notes, and guitar/amp artwork.
- `styles.css`: responsive grid, typography, cable rig, and small transitions.
- `app.js`: clean/distorted synthesized chords and Easter eggs.
- `cable.js`: pointer capture, cable geometry, jack snapping, and accessible connection controls.
- `ocean-motion.css`: native scroll timelines for underwater layers, with static fallback and reduced-motion states.
- `ocean.js`: throttled depth readout, scene and dog state changes, and timeline range measurements; no per-frame background rendering during scroll.
- `waves.js`: layered, asymmetric guitar ripples with overlapping strums, clean/driven timing, and bounded animation cleanup.
- `lab.js`: the chocolate Labrador's seabed walk, one-pass playback, photo lens interaction, visibility pausing, and reduced-motion pose.
- `public/images/chocolate-lab.jpg`: optimized photo for the dog's circular close-up.
- `dev-toolbar.jsx`: development-only Agentation mount in manual copy mode.
- `vite.config.js`: local server and production résumé asset.
- `shawn-xiong-resume.pdf`: the linked résumé.

## Small discoveries

- Click the period after Shawn's name for a brief burst of music notes.
- Tap the guitar to cycle G5, D5, E5, and C5. Unplugged uses a quiet clean channel; plugging into the amp routes the same guitar through a high-gain preamp, distortion, and cabinet filter.
- Hold and drag the cable by its grip to connect or disconnect. Tapping the plug or amp jack also toggles the connection, as do Enter/Space on the focused controls. Escape cancels an active drag; interrupted touch gestures restore the previous position and connection.
- Strum four times for a small message.
- Hover or focus the walking dog to see his real photo through a magnifying glass. Tap to toggle it on touch screens; Escape closes it. He pauses while you look.
- Hover or focus within a project to wake up its drawing.
- Type `encore` to toggle the after-hours palette; Escape restores the normal accents and stops sound.
- The intro's “Discover the little extras” link and footer's “Show Easter eggs” button open a guide with buttons for hidden notes, the guitar, and encore mode. The guide also opens without JavaScript through its native disclosure.

Sound is enabled by default, but audio only starts after a guitar click or tap. Use the Sound on/off button to mute it. Audio is synthesized locally; it stops when the tab is hidden or loses focus. The site uses the native cursor.

Animations respect reduced motion. Each page load starts unplugged; the former light-mode switch and acoustic variant have been removed. Content and native project disclosures remain usable without JavaScript.
