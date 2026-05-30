# AGENTS

Instructions for GitHub Copilot running in **agent mode** (the mode where it can read files, run terminal commands, and make multi-step edits autonomously). When you activate Copilot agent mode, paste a task from the list below as your first message.

---

## What is agent mode?

Agent mode lets Copilot work like a developer: it reads your codebase, writes files, runs `npm` commands, and iterates. It's the fastest way to build this project. Activate it in VS Code with `Ctrl+Shift+P` → "GitHub Copilot: Open Agent Mode" (requires Copilot subscription).

---

## How to use this file

1. Open VS Code in the project root
2. Activate Copilot agent mode
3. Copy one of the task prompts below and paste it as your message
4. Let Copilot run — it will read `ARCHITECTURE.md`, `DATA_MODEL.md`, and `SHADERS.md` automatically via `copilot-instructions.md`
5. Review the output, then move to the next task

Work through tasks in order. Each task builds on the last.

---

## Task 1 — Project scaffold

```
Read README.md and ARCHITECTURE.md in this project. Then:

1. Run: npm create vite@latest . -- --template react (in the current directory)
2. Run: npm install three @react-three/fiber @react-three/drei d3 zustand openapi-types
3. Delete src/App.css, src/assets/react.svg, public/vite.svg
4. Replace src/App.jsx with a component that renders a full-screen black R3F Canvas with a perspectivecamera at position [0, 0, 80] looking at origin
5. Replace src/main.jsx with standard React 18 root render, importing App
6. Create all folders and empty placeholder files listed in README.md folder structure
7. Run npm run dev and confirm no errors

Do not modify index.html except to change the title to "API Constellation".
```

---

## Task 2 — Background starfield

```
Read SHADERS.md. Implement the atmospheric background starfield:

1. Create src/shaders/star.vert with the vertex shader from SHADERS.md
2. Create src/shaders/star.frag with the fragment shader from SHADERS.md
3. Implement src/components/Canvas/StarField.jsx:
   - 2000 random background stars in a flat sphere (radius 300, z constrained ±20)
   - Use the star shaders via ShaderMaterial
   - aColor: near-white with subtle random tints
   - aBrightness: 0.05–0.4 (background, atmospheric)
   - aSize: 0.3–1.2
   - aIsFiltered: all 1.0
   - Animate uTime uniform in useFrame
4. Add StarField to Scene.jsx which is imported in App.jsx

Confirm: Page shows a convincing static night sky.
```

---

## Task 3 — OpenAPI parser

```
Read DATA_MODEL.md carefully — especially the StarData, ConstellationGroup, and ParseResult types.

Implement these utility files:

1. src/utils/colorMap.js — METHOD_COLORS constant, getStarVisuals(star), hexToRgb(hex)
2. src/utils/mockFrequency.js — assigns seeded pseudo-random frequency values weighted by HTTP method
3. src/utils/constellationGroup.js — groups stars by tags[0], assigns group colors by hashing tag name to HSL
4. src/utils/parseOpenAPI.js — full parser returning ParseResult from raw OpenAPI 3.0 JSON
5. src/hooks/useOpenAPIParser.js — React hook wrapping parseOpenAPI with loading/error state
6. src/components/UI/DropZone.jsx — drag-and-drop or click-to-upload .json file area

Also: download https://petstore3.swagger.io/api/v3/openapi.json and save it to public/sample-specs/petstore.json

Wire DropZone into App.jsx so dropping a file calls useOpenAPIParser and logs the result.

Confirm: Dropping petstore.json logs a clean StarData[] array with ~20 endpoints, correct method colors, grouped constellations, and non-zero frequency values.
```

---

## Task 4 — Stars on screen

```
Read DATA_MODEL.md section "Three.js buffer attribute layout".

1. Implement src/hooks/useStarLayout.js using d3-force:
   - forceManyBody strength -80
   - forceCollide radius = star.size * 3
   - forceLink between same-constellation stars, distance 20, strength 0.3
   - forceCenter at origin
   - Run 300 ticks synchronously
   - Scale output: multiply d3 x,y by 0.3, assign random z ±2
   - After layout, compute centroid for each constellation group

2. Implement src/components/Canvas/EndpointStar.jsx:
   - Single Points geometry with all buffer attributes from DATA_MODEL.md
   - Uses star.vert and star.frag shaders
   - Receives props: stars, hoveredStarId, selectedStarId
   - useMemo for geometry (rebuild on stars change)
   - useEffect for hover/selection updates (needsUpdate only, no rebuild)

3. Implement src/store.js with Zustand per DATA_MODEL.md store shape

4. Wire everything in App.jsx: parse → layout → render stars

Confirm: Dropping petstore.json renders ~20 colored stars in a loose cluster. GET stars are white-blue, POST are bright blue, DELETE are red.
```

---

## Task 5 — Constellation lines

```
Implement src/components/Canvas/Constellation.jsx:

- LineSegments geometry connecting stars within each constellation group in order
- Line opacity: 0.2, color from constellationGroup.color
- Text labels at each constellation centroid using <Text> from @react-three/drei
  - Label: constellation name (tag)
  - Size: 1.5, color white, opacity 0.5
- Memoize geometries, rebuild only when constellations or stars change
- Add Constellation to Scene.jsx

Confirm: You can see faint labeled constellations grouping related endpoints.
```

---

## Task 6 — Camera controls

```
Implement src/hooks/useCamera.js and src/components/Controls/ZoomControls.jsx:

Camera hook:
- Pan: pointer down + move → translate camera x/y, sensitivity 0.05
- Zoom: scroll wheel → move camera z, sensitivity 0.05, clamp z [15, 250]
- All movement lerps at speed 0.12 per frame via useFrame
- flyToStar(position): animates camera to [pos.x, pos.y, camera.z - 30]
- resetCamera(): animates back to [0, 0, 80]
- Export handlePointerDown, handlePointerMove, handlePointerUp, handleWheel

ZoomControls component:
- Fixed overlay, bottom-right corner
- Two buttons: + and −
- Each adjusts zoomLevel in store by ±15

Wire camera handlers onto the <Canvas> element in App.jsx.

Confirm: You can pan and zoom fluidly. The camera never flips or orbits — it stays facing the sky plane.
```

---

## Task 7 — Hover and click

```
Implement interaction:

1. src/hooks/useStarInteraction.js:
   - Raycaster against Points geometry ref
   - onPointerMove: find closest point within threshold 2.0, set hoveredStarId
   - onClick: set selectedStarId to hoveredStarId, or null if empty space
   - cursor changes to "pointer" on hover

2. src/components/UI/StarPanel.jsx:
   - Fixed right panel, width 380px, full height
   - Background #0A0A1A, border-left 1px solid rgba(255,255,255,0.1)
   - Shows: method badge (colored), path, summary, description
   - Parameters table: Name, In, Required, Type columns
   - Responses: status badges (green/amber/red), descriptions
   - Slide-in animation from right (CSS transform translateX)
   - Close button (×) in top-right corner

3. Pass hoveredStarId and selectedStarId as props from store into EndpointStar

Confirm: Hovering stars highlights them. Clicking opens a clean details panel. Clicking away closes it.
```

---

## Task 8 — Light trails

```
Read SHADERS.md section "trail.frag".

1. Create src/shaders/trail.frag with the trail fragment shader
2. Implement src/components/Canvas/LightTrail.jsx:
   - Detect "related" endpoint pairs: POST → GET on same resource base path
     (e.g. POST /pets and GET /pets/{id} are related)
   - For each pair, create a QuadraticBezierCurve3 with a control point offset upward by 5 units
   - Render as TubeGeometry (radius 0.05, tubularSegments 20)
   - Apply ShaderMaterial with trail.frag
   - uColor: blend of both endpoint colors
   - uSpeed: 0.4, uDensity: 3.0
   - Animate uTime in useFrame
   - Set transparent: true, depthWrite: false, side: DoubleSide

Add LightTrail to Scene.jsx.

Confirm: Faint glowing dashes travel between related endpoints.
```

---

## Task 9 — Search and filter

```
Implement filtering and search:

1. src/components/Controls/FilterBar.jsx:
   - Fixed bottom-center overlay
   - Toggle buttons for GET, POST, PUT, PATCH, DELETE
   - Each has colored dot from METHOD_COLORS
   - Active = white border, inactive = opacity 0.4
   - Calls toggleMethodFilter from store on click

2. src/components/UI/SearchBar.jsx:
   - Fixed top-center overlay
   - Dark styled text input, id="search-input"
   - 150ms debounced setSearchQuery
   - Clear button (×) when has content
   - Escape key clears search

3. In EndpointStar.jsx: update aIsFiltered buffer attribute when store.filteredStars changes
   - Stars not in filteredStars get aIsFiltered = 0.0 (shader discards them)

4. In Constellation.jsx: fade line opacity to 0.05 for groups where all stars are filtered out

Confirm: Typing "/pets" dims all non-pet endpoints. Toggling DELETE removes red stars from view.
```

---

## Task 10 — Test console and polish

```
Finalize the project:

1. Add "Try it" tab to StarPanel.jsx:
   - Input fields for each path and query parameter
   - Textarea for request body (POST/PUT/PATCH only)
   - Construct URL from store.baseUrl + endpoint path
   - Call fetch, display status (colored), response time ms, response body (JSON.stringify formatted)
   - CORS warning banner: "Most APIs block browser requests. Try a local API or add a CORS proxy."
   - "Copy as curl" button

2. src/components/UI/LoadingNebula.jsx:
   - Full-screen overlay when store.isLoading is true
   - Pulsing purple/blue CSS animation
   - "Mapping the universe..." text

3. src/components/UI/Legend.jsx:
   - Fixed bottom-left overlay
   - Method → color key using METHOD_COLORS
   - 12px font, compact layout

4. Keyboard shortcuts in App.jsx useEffect:
   - Escape → setSelected(null)
   - / → focus #search-input
   - R → resetCamera()

5. Add to index.html: meta description, Open Graph tags (title: "API Constellation", description: "Visualize your API as a navigable night sky")

6. Test with petstore.json and confirm everything works end-to-end

7. Run: npm run build — fix any build errors

8. Deploy: npx vercel --prod (or just confirm build succeeds for now)

Confirm: Full app works. Stars appear, constellations visible, click opens panel, search filters, trails animate, test console makes fetch calls.
```

---

## Utility tasks (run anytime)

### Fix performance issues with large specs

```
The app is slow with 200+ endpoint stars. Profile and fix performance issues. Common causes:
- Geometry being rebuilt on every render instead of useMemo
- D3 simulation running in useFrame instead of once
- New Three.js objects created inside render functions
- Too many useEffect dependencies triggering unnecessary updates

Read ARCHITECTURE.md section "Rendering performance rules" and audit every Canvas component against those rules. Fix all violations.
```

### Add sample spec buttons

```
Add a row of "Load sample" buttons to the DropZone that load pre-bundled specs from public/sample-specs/:
- Petstore (simple, ~20 endpoints)
- GitHub API (complex, 100+ endpoints)

Download and save a simplified GitHub API spec to public/sample-specs/github-api.json (use https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json — warn me if this URL doesn't work).

Each button should load the spec without requiring a file drop.
```
