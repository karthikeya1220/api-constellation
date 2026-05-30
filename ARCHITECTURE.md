# Architecture

A deep-dive into how API Constellation is structured, how data flows, and why each piece is designed the way it is.

---

## System overview

```
OpenAPI JSON file
       │
       ▼
 parseOpenAPI.js          ← converts raw spec into StarData[]
       │
       ▼
 useOpenAPIParser.js       ← React hook: manages parse state + errors
       │
       ▼
 useStarLayout.js          ← runs D3 force simulation → assigns x,y,z to each star
       │
       ▼
 Scene.jsx                 ← Three.js canvas via R3F
   ├── StarField.jsx       ← background atmosphere (non-interactive points)
   ├── EndpointStar.jsx    ← one per endpoint, uses star shader
   ├── Constellation.jsx   ← line segments between stars in the same group
   └── LightTrail.jsx      ← animated bezier curves (request flow)
       │
       ▼
 useStarInteraction.js     ← raycasting: detects hover + click on stars
       │
       ▼
 StarPanel.jsx             ← sidebar that shows endpoint details on click
```

---

## Data flow in detail

### 1. Input → parse

The user drops a `.json` file onto `DropZone.jsx`. The file is read as text with `FileReader`, parsed as JSON, then passed into `parseOpenAPI(rawJson)` which returns a `StarData[]` array (see `DATA_MODEL.md`).

The raw OpenAPI spec is **never stored in component state** — only the derived `StarData[]` is. This keeps the Three.js layer ignorant of OpenAPI schema details.

### 2. Layout

`useStarLayout(stars)` feeds the `StarData[]` into a D3 force simulation:

- `forceManyBody()` — repels stars from each other
- `forceLink()` — weak attraction between stars in the same constellation group
- `forceCenter()` — keeps the whole system centered at origin
- `forceCollide()` — prevents overlap, radius proportional to star brightness

The simulation runs for a fixed number of ticks (not live — we don't want stars drifting during interaction). Output: each star gets a `.x`, `.y`, `.z` position in world space.

### 3. Rendering pipeline

All stars are rendered as a single Three.js `Points` geometry with a custom vertex/fragment shader pair (`star.vert` / `star.frag`). This is far more performant than individual `Mesh` objects and allows per-star brightness and color via vertex attributes.

Constellation lines use `LineSegments` geometry — one geometry per constellation group, rebuilt when filter state changes.

Light trails are `QuadraticBezierCurve3` objects rendered as animated `TubeGeometry`, with an animated `dashOffset` uniform in the fragment shader to create the travelling-light effect.

### 4. Interaction

`useStarInteraction` attaches a `Raycaster` to the Three.js camera. On each pointer move, it tests against the `Points` geometry using a custom threshold (since points have no real geometry to intersect). The closest point within threshold becomes `hoveredStar`. On click, `hoveredStar` becomes `selectedStar` and is written to Zustand global state.

`StarPanel.jsx` subscribes to `selectedStar` from Zustand and renders the details panel independently of the canvas.

### 5. State management (Zustand store shape)

```js
{
  // Parsed data
  stars: StarData[],
  constellations: ConstellationGroup[],

  // Interaction state
  hoveredStarId: string | null,
  selectedStarId: string | null,

  // Filter state
  activeMethodFilters: Set<HttpMethod>,
  searchQuery: string,

  // Camera
  cameraTarget: [x, y, z],
  zoomLevel: number,

  // Actions
  setStars, setHovered, setSelected,
  toggleMethodFilter, setSearchQuery, flyToStar
}
```

---

## Rendering performance rules

These must be followed to keep the scene at 60fps with large specs (200+ endpoints):

1. **Never create a new Three.js object inside a render loop.** Geometries and materials are created once in `useMemo` and mutated via buffer attributes.
2. **All stars in one `Points` object.** Not one mesh per star.
3. **Constellation lines use `LineSegments`, not individual `Line` objects.**
4. **The D3 simulation runs once on data load, not every frame.**
5. **`useFrame` does only uniform updates** (time, hovered index). No geometry rebuilding per frame.
6. **Frustum culling is on by default in Three.js** — don't disable it.

---

## Camera system

The camera is a Three.js `PerspectiveCamera` positioned at `(0, 0, 80)` looking at origin. Controls are custom (not OrbitControls) because we want:

- **Pan**: drag to translate camera `x`/`y` (no orbit rotation — sky should always face you)
- **Zoom**: scroll wheel adjusts camera `z` (fly toward/away from the plane of stars)
- **Fly-to**: clicking a star triggers a smooth `lerp` animation over 60 frames to center that star

The sky is intentionally **flat** (all stars on roughly the same `z` plane ± some depth noise). This makes it feel like looking up at a real sky rather than navigating a 3D sphere.

---

## Constellation grouping algorithm

Endpoints are grouped into constellations by their OpenAPI `tags` array. If an endpoint has no tags, it goes into an "Ungrouped" catch-all constellation.

```
GET  /pets          → tags: ["pets"]          → Pets constellation
POST /pets          → tags: ["pets"]          → Pets constellation
GET  /pets/{id}     → tags: ["pets"]          → Pets constellation
POST /orders        → tags: ["orders"]        → Orders constellation
```

Within a constellation, stars are connected by lines in the order they appear in the spec (not fully connected — that creates too much visual noise).

See `constellationGroup.js` for the full implementation prompt in `PROMPTS.md`.

---

## The test console (StarPanel)

The test console in `StarPanel.jsx` uses the `fetch` API directly from the browser. It:

1. Reads the `servers[0].url` from the OpenAPI spec as the base URL
2. Constructs the full URL from the selected endpoint's `path`
3. Renders input fields for each path/query parameter
4. Renders a textarea for request body (POST/PUT/PATCH)
5. On submit, calls `fetch` and displays the response status + body

CORS will block most real API calls from the browser — include a note in the UI that users may need a CORS proxy or to run the API locally.
