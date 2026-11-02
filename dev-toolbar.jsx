import React from 'react';
import { createRoot } from 'react-dom/client';
import { Agentation } from 'agentation';

// Manual copy/paste mode: no endpoint and no external feedback connection.
// This module is dynamically imported only during development.
if (import.meta.env.DEV && !document.getElementById('agentation-root')) {
  const mount = document.createElement('div');
  mount.id = 'agentation-root';
  document.body.append(mount);
  createRoot(mount).render(<Agentation />);
}
