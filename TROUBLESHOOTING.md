# Troubleshooting

Common problems, their causes, and exact fixes. Read this before asking Copilot to debug — most issues are one of these.

---

## Setup issues

### `Cannot find module 'three'` or R3F import errors

**Cause:** Dependencies not installed, or Vite config is wrong.

**Fix:**
```bash
npm install three @react-three/fiber @react-three/drei d3 zustand
```
Then confirm `node_modules/three` exists. If not, delete `node_modules` and `package-lock.json` and reinstall.

---

### Shader imports fail (`?raw` not working)

**Cause:** Vite doesn't recognize `.vert` and `.frag` extensions by default.

**Fix:** Add to `vite.config.js`:
```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.vert', '**/*.frag'],
});
```

If that doesn't work, rename shaders to `.glsl.js` and export the string directly:
```js
// star.vert.js
export default `
uniform float uTime;
...
`;
```

---

## Canvas and rendering issues

### Black screen (nothing renders)

Work through this checklist in order:

1. Open browser DevTools → Console. Any errors? Fix those first.
2. Is `<Canvas>` present in the DOM? Inspect the element — it should be a `<canvas>` tag.
3. Is `<Canvas>` getting a size? Add `style={{ width: '100vw', height: '100vh' }}` to it.
4. Is the camera pointing at the scene? Default R3F camera is at `[0, 0, 5]`. If your stars are at `z: 0` and camera is at `z: 5`, they should be visible. If stars are at `z: 100`, camera can't see them.
5. Add `<axesHelper args={[5]} />` from drei — if you see colored axes, the canvas is working and the issue is your geometry.

### Stars are squares, not circles

**Cause:** The fragment shader's `discard` for pixels outside the circle isn't working, or `gl_PointCoord` isn't available.

**Fix:** Ensure the `ShaderMaterial` has:
```js
{
  vertexShader: starVert,
  fragmentShader: starFrag,
  transparent: true,
  depthWrite: false,
}
```

Also ensure you're using `gl_PointCoord` in the fragment shader to get the UV within the point sprite.

### Stars are all the same size

**Cause:** The `aSize` buffer attribute isn't being read by the vertex shader, or the attribute name doesn't match.

**Fix:** Confirm:
1. `geo.setAttribute('aSize', new Float32BufferAttribute(sizeArray, 1))` is called
2. The vertex shader declares `attribute float aSize;`
3. `gl_PointSize` uses `aSize` in the calculation

### Stars don't update on hover (still look the same)

**Cause:** `needsUpdate = true` not called after mutating the buffer attribute array.

**Fix:**
```js
const attr = geometryRef.current.attributes.aIsHovered;
stars.forEach((star, i) => {
  attr.array[i] = star.id === hoveredStarId ? 1.0 : 0.0;
});
attr.needsUpdate = true;  // THIS LINE IS REQUIRED
```

### Geometry rebuilds every frame (performance tank)

**Cause:** `useMemo` is missing or has incorrect dependencies.

**Fix:** Geometry should only rebuild when the `stars` array reference changes (i.e., when new spec is loaded):
```js
const geometry = useMemo(() => {
  // create geometry
}, [stars]); // ← only stars as dependency, NOT hoveredStarId
```

Hover state is updated via `needsUpdate`, not by rebuilding geometry.

---

## D3 layout issues

### All stars appear at position (0, 0, 0)

**Cause:** D3 force simulation mutates the input nodes array. If you spread (`[...stars]`) the nodes before running simulation, D3 mutates the copies but you return the original `stars` which still have `x: 0, y: 0`.

**Fix:**
```js
// WRONG
const nodes = stars.map(s => ({ ...s }));
simulation.nodes(nodes).tick(300);
return stars; // ← original, not mutated

// RIGHT
const nodes = stars.map(s => ({ ...s }));
simulation.nodes(nodes).tick(300);
// nodes now have x, y from D3 — copy back
return stars.map((star, i) => ({ ...star, x: nodes[i].x * 0.3, y: nodes[i].y * 0.3, z: (Math.random() - 0.5) * 4 }));
```

### Stars cluster into one blob

**Cause:** `forceManyBody` strength is too weak or forceLink is too strong.

**Fix:** Adjust in `useStarLayout.js`:
```js
d3.forceManyBody().strength(-120)     // increase repulsion
d3.forceLink(links).strength(0.1)     // decrease link pull
d3.forceCollide().radius(d => d.size * 5)  // increase collision radius
```

---

## Interaction issues

### Clicking the canvas does nothing (no star selected)

**Cause:** Raycaster threshold is too small, or the pointer events are not reaching the canvas.

**Fix:**
1. Increase raycaster threshold: `raycaster.params.Points.threshold = 3`
2. Confirm `handleClick` is wired to the `<Canvas>` component's `onClick` prop
3. Log the raycaster intersects array — if it's always empty, the issue is the threshold

### Panel doesn't slide in

**Cause:** CSS transition not working because the element is conditionally rendered (not just hidden).

**Fix:** Always render the panel but control visibility via CSS:
```jsx
<div style={{
  transform: selectedStar ? 'translateX(0)' : 'translateX(100%)',
  transition: 'transform 0.2s ease-out',
  // ... other styles
}}>
```
Don't use `{selectedStar && <StarPanel>}` — the element needs to be in the DOM for the slide-out animation to work.

---

## Filter / search issues

### Filtered stars visually disappear but cause console errors

**Cause:** Setting `aIsFiltered = 0.0` hides the star via shader `discard`, but if raycasting still tests those stars, they cause incorrect hover hits.

**Fix:** In `useStarInteraction.js`, filter out non-visible stars before raycasting:
```js
const visibleStars = stars.filter(s => filteredStarIds.has(s.id));
// only test raycaster against visible stars
```

### Search doesn't update stars

**Cause:** Zustand `filteredStars` selector is not reactive — component isn't re-subscribing.

**Fix:** Ensure you're using the Zustand selector, not just reading from a local variable:
```js
// RIGHT
const filteredStars = useConstellationStore(s => s.filteredStars);

// WRONG (stale closure)
const { filteredStars } = useConstellationStore.getState();
```

---

## Build / deploy issues

### `npm run build` fails with shader import error

**Fix:** Ensure `vite.config.js` includes `.vert` and `.frag` in `assetsInclude` (see Setup section above).

### Vercel deploy shows blank page

**Cause:** Client-side routing not configured for Vercel.

**Fix:** Add `vercel.json` to project root:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Large spec (200+ endpoints) causes browser tab to freeze

**Cause:** D3 simulation with 200+ nodes is expensive synchronously.

**Fix:** Move the simulation to a Web Worker:
```js
// In useStarLayout.js, replace synchronous ticks with:
const worker = new Worker(new URL('../workers/layoutWorker.js', import.meta.url));
worker.postMessage({ stars, links });
worker.onmessage = (e) => setLayoutStars(e.data.stars);
```

Ask Copilot: "Move the D3 force simulation in useStarLayout.js to a Web Worker so it doesn't block the main thread."
