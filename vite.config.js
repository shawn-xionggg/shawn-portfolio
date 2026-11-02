import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

export default defineConfig({
  base: './',
  server: { port: 5173 },
  plugins: [{
    name: 'portfolio-resume',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'shawn-xiong-resume.pdf',
        source: readFileSync(new URL('./shawn-xiong-resume.pdf', import.meta.url)),
      });
    },
  }],
});
