# NEON BREACH — Arena Protocol

A compact first-person arena shooter built with **Three.js** and **Vite**. Fight Unit K-8 in a neon-lit circular combat chamber — one hunter, one enemy, no exit.

Part of the [AI Coder course](../README.md) (Week 1, Day 1 — 3D FPS Game project).

## Quick start

From the repository root:

```bash
cd instant
npm install
npm run dev
```

Vite prints a local URL (usually `http://localhost:5173`). Open it in your browser, pick a threat level, and click **ENTER ARENA**.

## Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Build optimized static assets into `dist/` |
| `npm run preview` | Serve the production build locally |

### Production preview

```bash
npm run build
npm run preview
```

## How to play

### Controls

| Key | Action |
|-----|--------|
| `↑` / `↓` | Move forward / backward |
| `←` / `→` | Turn left / right |
| `Space` | Fire plasma shots |

### Objective

Reduce Unit K-8's health to zero before yours runs out. Each match is a round; wins and losses are tracked on the HUD scoreboard.

### Difficulty levels

| Level | Enemy health | Behavior |
|-------|--------------|----------|
| **Easy** | 60 | Slower movement and firing; lower damage |
| **Medium** | 100 | Balanced pursuit and fire rate (default) |
| **Hard** | 110 | Faster, more aggressive; dodges when you shoot |

You can change difficulty on the start screen or after a round ends before clicking **RUN IT BACK**.

## Project structure

```
instant/
├── index.html          # Game shell, HUD, start/result screens
├── src/
│   ├── main.js         # Three.js scene, game loop, combat logic
│   └── style.css       # Neon cyberpunk UI styling
├── dist/               # Production build output (after `npm run build`)
└── package.json
```

## Tech stack

- **[Three.js](https://threejs.org/)** — WebGL rendering, lighting, shadows, and 3D arena
- **[Vite](https://vite.dev/)** — Dev server and bundler

## Requirements

- **Node.js** 18+ recommended
- A modern browser with WebGL support

## License

ISC
