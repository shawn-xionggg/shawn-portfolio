# Portfolio design

The page presents Shawn's engineering work with a small guitar influence. It uses the UI Skills Swiss-design guidance and Animate timing/accessibility guidance: clear hierarchy, an ordered grid, generous space, and brief purposeful movement.

## Layout and typography

- A 12-column grid within a 1280px page, with 24px mobile and 48px desktop gutters.
- IBM Plex Sans, with system sans-serif fallback. Lightweight, oversized name typography anchors the introduction; small monospaced labels provide supporting context.
- The desktop introduction pairs the name, Waterloo label, and two direct links with a separate guitar area. There are no introductory marketing paragraphs or header monogram. On narrow screens, the guitar follows the name. The Resume link uses unaccented spelling and a lavender outline to stand out from blue interaction accents.
- Projects, experience, and about use section labels on the left and content on the right, collapsing to one column on mobile.
- Projects, Experience, and About each sit in a bordered dark panel with a short accent rule and generous separation. Section labels use 16px type on mobile and 18px on desktop.
- Each project has its own outlined inset panel. Experience separates the current role from its work; About separates engineering from life outside it. Native expandable build notes preserve keyboard and no-JavaScript behavior.
- The underwater background uses a few broad surface ripples, soft descending light shafts, and four current contours. Scrolling moves these layers upward at different speeds and fades the scene into deep navy. Avoid dots, particle fields, and busy textures. Panels have translucent blue edges and dark inset cards to keep content readable.
- A “Below the surface / Scroll to dive” link separates the introduction from the work. A quiet desktop depth gauge progresses from 000 to 120 m; these numbers are a visual metaphor for page progress. It hides below 1480px so it never crowds the content.

## Palette and guitar rig

The site stays dark: `#0b0e14` background, `#e6edf7` text, and `#91caff` accents. Muted text and separators derive from the ink. Keep the rock influence restrained: line-drawn hardware, a small amp, one cool accent, and a faint amp glow when connected.

There is no header theme switch or acoustic guitar. The electric guitar starts unplugged on each load and plays a quiet clean tone. A draggable quarter-inch cable plug sits beside an amp input. Releasing its tip near the jack connects it, turns on the amp indicator, and enables distortion. Pulling it away restores clean tone. The flexible SVG cord follows the grip within the illustration area and stays anchored to the guitar.

When connected, the plug's collar sits against the jack and the metal shaft is concealed inside the socket. Soft overhead blue-white stage lights and the amp grille light turn on with the connection and fade out on disconnect. Lighting is a static, non-interactive layer animated only through opacity; reduced motion makes the change immediate.

## Motion and interaction

Hover motion lasts about 150ms; guitar artwork transitions and section arrivals last 180–240ms. Transitions animate opacity and transforms. Guitar strings briefly vibrate on activation, without forced layout reads. Reduced-motion preferences disable nonessential animation.

Offscreen sections and their content blocks start transparent and slightly folded back, then unfold from their top edge as they enter the viewport. The transform settles over 620ms and opacity over 420ms, with content blocks staggered by 65ms. Each reveal runs once. Content is visible by default without JavaScript; reduced motion reveals everything immediately, and keyboard focus reveals any pending ancestors.

The ocean follows native scrolling without scroll interception. Its animation runs only on scroll, resize, and content-height changes, using one queued frame and transform/opacity updates. There is no perpetual rendering loop. Reduced motion removes scene parallax, retaining depth shading and the gauge. Without JavaScript the scene remains a static illustration and all content stays available. The cursor glow and amplifier lights remain independent of ocean depth.

The introduction enters in a short stagger, finishing within 480ms. Strumming adds a restrained body recoil and two fading resonance rings; hovering only animates the strings. Cable dragging uses pointer capture and one scheduled render per frame; geometry is measured at gesture start and resize, not in a perpetual animation loop. Reduced motion keeps direct dragging available while disabling decorative motion.

Mouse and touch share the same drag behavior. The plug and input also support tap and keyboard activation. Escape, pointer cancellation, and lost capture restore the previous position and connection. Focus indicators and live connection announcements provide feedback. Responsive resizing keeps an inserted plug docked.

Use the native cursor, with grab/grabbing feedback on the cable plug. A soft blue halo follows mouse movement without a pick graphic, idles when settled, and never intercepts input. It hides on touch and keyboard navigation and follows directly with reduced motion. Small discoveries remain in the name's period, project drawings, four-strum message, `encore` shortcut, and footer hints. Sound is enabled by default and starts on a guitar click or tap, with a visible mute toggle. Plugging in routes the electric voice through a high-gain preamp, oversampled distortion, and cabinet filtering; unplugging bypasses that chain and lowers the volume.

Keep focus indicators visible and controls comfortably tappable. Core content must remain readable without JavaScript. Preserve the existing project names, links, technical details, and experience; Allos is the current project name.

Easter eggs are discoverable through an intro link, a visible native disclosure beneath About, and a labeled footer button. The guide offers direct actions for the musical notes, guitar, and encore palette, with text explaining each interaction. Keep the hidden shortcuts working alongside these controls.

## Development feedback

Agentation mounts only in development, using an isolated React root. Manual copy/paste mode has no server endpoint. Production remains a static HTML/CSS/JavaScript site without the toolbar or React runtime.
