# Milestones

Build API Constellation in 10 phases. Each phase ends with something you can see, demo, or show someone. Never start a new phase until the current one looks good.

---

## Phase 0 — Scaffold (Day 1)

**Goal:** A running Vite + React + Three.js app with a black canvas.

### Tasks
- [ ] `npm create vite@latest api-constellation -- --template react`
- [ ] Install dependencies: `npm install three @react-three/fiber @react-three/drei d3 zustand openapi-types`
- [ ] Delete all default Vite boilerplate (App.css, logo, counter)
- [ ] Create `src/App.jsx` with a full-screen black `<Canvas>` from R3F
- [ ] Confirm the page is black with no console errors
- [ ] Create the full folder structure from `README.md`
- [ ] Create empty placeholder files for all components and hooks (just `export default function X() {}`)

**Done when:** Browser shows a black full-screen canvas. No errors.

---

## Phase 1 — Atmosphere (Day 1–2)

**Goal:** A beautiful static starfield background. This is pure atmosphere — not data yet.

### Tasks
- [ ] Implement `StarField.jsx` — a `Points` geometry with ~2000 random background stars
- [ ] Stars should vary in size (0.5–2.0) and brightness (dim, atmospheric)
- [ ] Use the `star.vert` / `star.frag` shaders from `SHADERS.md`
- [ ] No interaction needed — purely visual
- [ ] Add a very subtle slow rotation to the background field (`useFrame` rotating by `delta * 0.005`)

**Done when:** Page looks like a convincing night sky with subtly drifting background stars.

---

## Phase 2 — Parser (Day 2–3)

**Goal:** OpenAPI JSON → `StarData[]` in the browser. No visuals yet.

### Tasks
- [ ] Implement `src/utils/parseOpenAPI.js` (see `PROMPTS.md` for the Copilot prompt)
- [ ] Implement `src/utils/colorMap.js` with `METHOD_COLORS` from `DATA_MODEL.md`
- [ ] Implement `src/utils/mockFrequency.js` — randomly assigns `frequency` (0.1–1.0) to each endpoint
- [ ] Implement `src/utils/constellationGroup.js` — groups stars by tag
- [ ] Implement `DropZone.jsx` — drag-and-drop or click-to-upload a `.json` file
- [ ] Wire into `useOpenAPIParser.js` hook
- [ ] `console.log` the parsed `StarData[]` array to verify output
- [ ] Add `public/sample-specs/petstore.json` (download from https://petstore3.swagger.io/api/v3/openapi.json)

**Done when:** Dropping `petstore.json` onto the page logs a clean `StarData[]` array with correct colors, groups, and positions `x/y/z` all `0` (layout not done yet).

---

## Phase 3 — Stars appear (Day 3–4)

**Goal:** Endpoint stars placed on screen using D3 layout. First visual with real data.

### Tasks
- [ ] Implement `useStarLayout.js` — D3 force simulation → assigns x/y/z to each `StarData`
- [ ] Implement `EndpointStar.jsx` — renders all stars as a single `Points` geometry with shaders
- [ ] Wire `DropZone` → `useOpenAPIParser` → `useStarLayout` → `EndpointStar`
- [ ] Stars should be colored by HTTP method per `colorMap.js`
- [ ] Star size/brightness should reflect `frequency`

**Done when:** Dropping petstore.json makes colored stars appear in a loose cluster on the black canvas.

---

## Phase 4 — Constellations (Day 4–5)

**Goal:** Stars in the same tag group are connected by faint lines.

### Tasks
- [ ] Implement `Constellation.jsx` — `LineSegments` geometry connecting stars in each group
- [ ] Lines should be faint (opacity 0.15–0.25) and colored with the group color
- [ ] Each constellation group should have a subtle label (the tag name) at its centroid
- [ ] Labels use `<Text>` from `@react-three/drei`

**Done when:** You can clearly see distinct constellation shapes for each API resource group.

---

## Phase 5 — Camera controls (Day 5–6)

**Goal:** Pan and zoom freely around the sky.

### Tasks
- [ ] Implement `useCamera.js`
- [ ] **Pan**: click + drag → translate camera x/y (no rotation)
- [ ] **Zoom**: scroll wheel → camera moves along z axis (not FOV change)
- [ ] Clamp zoom: min z = 10, max z = 200
- [ ] Implement `ZoomControls.jsx` — `+` and `-` buttons as UI overlay
- [ ] Smooth all camera movements with lerp (interpolation factor ~0.08)

**Done when:** You can freely explore the full star map with natural feeling pan and zoom.

---

## Phase 6 — Interaction (Day 6–7)

**Goal:** Hovering highlights a star. Clicking opens the details panel.

### Tasks
- [ ] Implement `useStarInteraction.js` — raycasting against the `Points` geometry
- [ ] Hovered star: scale up + brighten (update `aIsHovered` buffer attribute)
- [ ] Cursor changes to `pointer` on hover
- [ ] Implement `StarPanel.jsx` — slides in from the right on star click
- [ ] Panel shows: method badge, path, summary, description, parameters table, responses list
- [ ] Clicking empty space deselects and closes the panel

**Done when:** Clicking any endpoint star opens a clean details panel. Panel closes on click-away.

---

## Phase 7 — Light trails (Day 7–9)

**Goal:** Animated light trails showing request flow relationships.

### Tasks
- [ ] Implement `LightTrail.jsx`
- [ ] Define "related" endpoints as: same tag group + POST → GET on same resource path
  - Example: `POST /pets` → `GET /pets/{id}` → `DELETE /pets/{id}`
- [ ] Render trails as `TubeGeometry` along a `QuadraticBezierCurve3`
- [ ] Use `trail.frag` shader with animated `uTime` uniform for travelling-light effect
- [ ] Trails should be subtle — visible but not distracting from the stars themselves

**Done when:** Faint glowing light trails visibly travel between related endpoints.

---

## Phase 8 — Search and filter (Day 9–10)

**Goal:** Filter by HTTP method and search by endpoint name.

### Tasks
- [ ] Implement `FilterBar.jsx` — row of method toggle buttons (GET / POST / PUT / PATCH / DELETE)
- [ ] Toggling a method sets `activeMethodFilters` in Zustand
- [ ] Stars for inactive methods fade out (update `aIsFiltered` buffer attribute)
- [ ] Constellation lines for groups with all-filtered stars also fade out
- [ ] Implement `SearchBar.jsx` — text input that highlights matching stars
- [ ] Matching = path or summary contains the search string (case-insensitive)
- [ ] Non-matching stars dim to 10% brightness during an active search

**Done when:** You can type `/pets` and see only pet-related stars brighten. Method toggles work visually.

---

## Phase 9 — Test console (Day 10–12)

**Goal:** Make live API calls from within the star panel.

### Tasks
- [ ] Add a "Try it" tab to `StarPanel.jsx`
- [ ] Render input fields for each `path` and `query` parameter
- [ ] Render a textarea for `requestBody` (POST/PUT/PATCH)
- [ ] Construct the full URL from `baseUrl` + `path` with params substituted
- [ ] Call `fetch` and display: status code (colored), response time, response body (formatted JSON)
- [ ] Add a CORS warning banner explaining that most public APIs will block browser requests
- [ ] Add a "Copy as curl" button that generates the equivalent curl command

**Done when:** You can make a real API call to petstore or a local API from the star panel and see the response.

---

## Phase 10 — Polish and deploy (Day 12–14)

**Goal:** Production-ready. Shareable URL. Portfolio-worthy.

### Tasks
- [ ] Add a loading animation (`LoadingNebula.jsx`) while parsing large specs
- [ ] Add a `Legend.jsx` component — small overlay showing method → color key
- [ ] Add a "Reset camera" button that flies back to overview
- [ ] Add keyboard shortcuts: `Escape` = deselect, `/` = focus search, `R` = reset camera
- [ ] Test with 3 real-world specs: Petstore, GitHub API, Stripe API
- [ ] Fix any performance issues with large specs (200+ endpoints)
- [ ] Add `<meta>` tags, favicon, and Open Graph image for social sharing
- [ ] Deploy to Vercel: `npm i -g vercel && vercel`
- [ ] Add GitHub repository with a good README including a live demo GIF

**Done when:** The live URL works on mobile and desktop. You'd be proud to tweet it.

---

## Phase summary

| Phase | What you build | Days |
|---|---|---|
| 0 | Scaffold + blank canvas | 1 |
| 1 | Atmospheric starfield | 1–2 |
| 2 | OpenAPI parser | 2–3 |
| 3 | Endpoint stars on screen | 3–4 |
| 4 | Constellation lines | 4–5 |
| 5 | Pan + zoom camera | 5–6 |
| 6 | Hover + click + panel | 6–7 |
| 7 | Animated light trails | 7–9 |
| 8 | Search + filter | 9–10 |
| 9 | Live test console | 10–12 |
| 10 | Polish + deploy | 12–14 |
