# Copilot instructions

These instructions are automatically read by GitHub Copilot in agent mode when working in this repository. They tell Copilot exactly how this project is structured and how to generate code that fits.

---

## Project identity

This is **API Constellation** — a web app that renders an OpenAPI/Swagger spec as an interactive 3D night sky. Every endpoint is a star. It's a portfolio project built with Vite, React, React Three Fiber, Three.js, D3, and Zustand.

---

## Tech stack (use these, nothing else)

- **Vite** — build tool and dev server
- **React 18** — UI framework
- **React Three Fiber (R3F)** — React renderer for Three.js (`@react-three/fiber`)
- **Drei** — R3F helpers (`@react-three/drei`) — use for `<Text>`, `<OrthographicCamera>`, `<Stats>`
- **Three.js** — 3D engine (always access via R3F, not raw `new THREE.Scene()`)
- **D3** — force simulation for star layout only (`d3-force`)
- **Zustand** — global state management
- **Vanilla CSS** — styling (no Tailwind, no CSS-in-JS, no styled-components)

Never suggest or add: Redux, MobX, React Query, Axios, Tailwind, emotion, styled-components, React Spring.

---

## Folder conventions

| What | Where |
|---|---|
| Three.js canvas components | `src/components/Canvas/` |
| HTML overlay UI components | `src/components/UI/` |
| Camera and input controls | `src/components/Controls/` |
| React hooks | `src/hooks/` |
| Pure utility functions (no React) | `src/utils/` |
| GLSL shader files | `src/shaders/` |

---

## Code style rules

- Use **function declarations** for components: `export default function StarPanel()` not arrow functions
- Use **named exports** for hooks and utils: `export function useStarLayout()` not default
- Use **`useMemo`** for any Three.js geometry or material creation — never create them inside render
- Use **`useFrame`** for animation — never `requestAnimationFrame` directly
- Use **`useCallback`** for event handlers passed as props
- **Never mutate Zustand state directly** — always use the setter actions
- **No TypeScript** — plain JavaScript only
- **No PropTypes** — this is a solo portfolio project
- Comments only on non-obvious logic — no JSDoc

---

## Data model

The single most important type is `StarData`. Every star on the canvas is one `StarData` object. Always refer to stars by `star.id` (which is `"{method}:{path}"`). Full type definitions are in `DATA_MODEL.md`.

The Zustand store is in `src/store.js`. Always import store values with:
```js
import { useConstellationStore } from '../store';
const stars = useConstellationStore(s => s.stars);
```

---

## Shader conventions

- Shaders live in `src/shaders/*.vert` and `src/shaders/*.frag`
- Import them as raw strings: `import starVert from '../shaders/star.vert?raw'`
- Uniform names use camelCase with `u` prefix: `uTime`, `uPixelRatio`
- Attribute names use camelCase with `a` prefix: `aColor`, `aBrightness`, `aIsHovered`
- Varying names use camelCase with `v` prefix: `vColor`, `vBrightness`
- Full shader source is in `SHADERS.md` — never rewrite shaders from scratch, only modify `// TWEAK` lines

---

## Performance rules

These are hard rules — Copilot must never generate code that violates them:

1. All endpoint stars are rendered in **a single `Points` object** — never one mesh per star
2. **Never create new Three.js objects inside `useFrame`** — only mutate uniforms and buffer attributes
3. **Buffer attributes are updated via `.needsUpdate = true`**, not by rebuilding geometry
4. D3 force simulation runs **once synchronously on data load**, not per frame
5. `LineSegments` for constellation lines — not individual `Line` objects per connection

---

## Common patterns

### Reading from the store in a component
```js
const selectedStar = useConstellationStore(s => s.selectedStar);
const setSelected = useConstellationStore(s => s.setSelected);
```

### Creating a memoized Three.js geometry
```js
const geometry = useMemo(() => {
  const geo = new BufferGeometry();
  // ... fill buffer attributes ...
  return geo;
}, [stars]); // only rebuild when stars array changes
```

### Updating a buffer attribute without rebuilding
```js
useEffect(() => {
  const attr = geometryRef.current.attributes.aIsHovered;
  stars.forEach((star, i) => {
    attr.array[i] = star.id === hoveredStarId ? 1.0 : 0.0;
  });
  attr.needsUpdate = true;
}, [hoveredStarId]);
```

### Importing shaders
```js
import starVert from '../../shaders/star.vert?raw';
import starFrag from '../../shaders/star.frag?raw';
```

---

## What Copilot should NOT generate

- No `new THREE.Scene()` or `new THREE.WebGLRenderer()` — R3F handles this
- No `document.getElementById('canvas')` — R3F handles canvas mounting
- No `window.addEventListener('resize', ...)` — R3F handles resize
- No `OrbitControls` from Three.js — we have custom camera controls in `useCamera.js`
- No `useEffect` for Three.js object creation — use `useMemo` instead
- No inline styles — use CSS classes from `src/styles/`
- No hardcoded color hex values outside of `colorMap.js`
