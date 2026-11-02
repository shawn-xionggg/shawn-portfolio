# Portfolio design

The page presents Shawn's engineering work with a small guitar influence. It uses the UI Skills Swiss-design guidance and Animate timing/accessibility guidance: clear hierarchy, an ordered grid, generous space, and brief purposeful movement.

## Layout and typography

- A 12-column grid within a 1280px page, with 24px mobile and 48px desktop gutters.
- IBM Plex Sans, with system sans-serif fallback. Lightweight, oversized name typography anchors the introduction; small monospaced labels provide supporting context.
- The desktop introduction pairs the name and biography with a separate guitar area. On narrow screens, the guitar follows the introduction.
- Projects, experience, and about use section labels on the left and content on the right, collapsing to one column on mobile.
- Thin rules separate direct project rows. Native expandable build notes preserve keyboard and no-JavaScript behavior.
- No decorative card grid, stock images, or background effects competing with the work.

## Themes

Dark is the first-visit default: `#0b0e14` background, `#e6edf7` text, and `#91caff` accents. Light mode uses `#f5f3ed` paper, `#292925` text, and `#865d36` accents. Muted text and separators derive from each theme's ink.

The header switch changes both the guitar artwork and audio voice. Dark mode shows an electric guitar with optional overdriven power chords. Light mode shows an acoustic guitar with a soundhole, binding, pickguard, and clean full chords. The label, caption, and accessible name follow the selected theme.

## Motion and interaction

Hover motion lasts about 150ms; guitar artwork transitions and section arrivals last 180–240ms. Transitions animate opacity and transforms. Guitar strings briefly vibrate on activation, without forced layout reads. Reduced-motion preferences disable nonessential animation.

The introduction enters in a short stagger, finishing within 480ms. Strumming adds a restrained body recoil and two fading resonance rings; hovering only animates the strings. Theme changes rotate and fade in the sun or moon icon over 240ms. Repeated interactions cancel prior instrument and icon animations, and enabling reduced motion cancels them immediately.

The glowing pick follows beside the native mouse cursor, with a broad blue halo in dark mode. Both idle when settled and never intercept input. They hide on touch and keyboard navigation. Small discoveries remain in the name's period, project drawings, four-strum message, `encore` shortcut, and footer hints. Sound is enabled by default and starts on a guitar click or tap, with a visible mute toggle. The electric voice uses a high-gain preamp, oversampled distortion, and cabinet filtering; the acoustic voice bypasses that chain.

Keep focus indicators visible and controls comfortably tappable. Core content must remain readable without JavaScript. Preserve the existing project names, links, technical details, and experience; Allos is the current project name.

## Development feedback

Agentation mounts only in development, using an isolated React root. Manual copy/paste mode has no server endpoint. Production remains a static HTML/CSS/JavaScript site without the toolbar or React runtime.
