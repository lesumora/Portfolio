# Portfolio

Vite + React + TypeScript, styled with Tailwind CSS v4, icons from lucide-react, and light
animation via framer-motion. The background is a canvas-based network mesh.

## Run it

```bash
npm install
npm run dev
```

## Network Mesh

- **Colors:** edit the CSS variables at the top of `src/index.css`. The mesh background reads
  `--line`, `--node`, `--primary` and `--accent-glow`, so it re-themes with the rest of the page.
- **Mesh density:** constants at the top of `src/components/NetworkBackground.tsx`
  (`NODE_COUNT`, `CONNECT_DIST`, `MOUSE_RADIUS`).
