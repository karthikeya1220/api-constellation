# Copilot prompt library

Ready-to-paste prompts for every major component. Open the relevant file in VS Code, paste the prompt into Copilot Chat, and press Enter. Each prompt is self-contained and references the type contracts from `DATA_MODEL.md`.

---

## How to use this file

1. Open the file you want to generate in VS Code (or create the empty file)
2. Open Copilot Chat (`Ctrl+Shift+I` / `Cmd+Shift+I`)
3. Copy the prompt below and paste it into Copilot Chat
4. If the output is wrong, use the **correction prompts** listed under each section
5. Never paste prompts into the inline autocomplete — always use Chat

---

## Setup prompts

### Install and scaffold

```
Create a new Vite React app called api-constellation. Install these npm packages: three, @react-three/fiber, @react-three/drei, d3, zustand, openapi-types. Then create this exact folder structure with empty placeholder files:

src/
  components/Canvas/StarField.jsx
  components/Canvas/EndpointStar.jsx
  components/Canvas/Constellation.jsx
  components/Canvas/LightTrail.jsx
  components/Canvas/Scene.jsx
  components/UI/DropZone.jsx
  components/UI/StarPanel.jsx
  components/UI/Legend.jsx
  components/UI/SearchBar.jsx
  components/UI/LoadingNebula.jsx
  components/Controls/ZoomControls.jsx
  components/Controls/FilterBar.jsx
  hooks/useOpenAPIParser.js
  hooks/useThreeScene.js
  hooks/useStarLayout.js
  hooks/useCamera.js
  hooks/useStarInteraction.js
  utils/colorMap.js
  utils/parseOpenAPI.js
  utils/constellationGroup.js
  utils/mockFrequency.js
  shaders/star.vert
  shaders/star.frag
  shaders/trail.frag

Each file should export an empty function or object with the correct name. App.jsx should render a full-screen black R3F Canvas.
```

---

## Parser prompts

### `parseOpenAPI.js`

```
Write a function called parseOpenAPI(rawJson) in src/utils/parseOpenAPI.js.

It takes a raw OpenAPI 3.0 JSON object and returns a ParseResult object with this shape:
{
  stars: StarData[],
  constellations: ConstellationGroup[],
  apiTitle: string,
  apiVersion: string,
  baseUrl: string,
  totalEndpoints: number,
  error: string | null
}

Where StarData has these fields:
  id: "{method}:{path}" e.g. "GET:/pets/{id}"
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  path: string
  summary: string (from operationId or summary field, fallback to path)
  description: string
  tags: string[]
  parameters: array of { name, in, required, description, schema: { type, example } }
  requestBody: { required, contentType, schema, example } or null
  responses: array of { statusCode, description, contentType, schema }
  frequency: 0.0 (will be set by mockFrequency.js later)
  constellationId: tags[0] or "ungrouped" if no tags
  x: 0, y: 0, z: 0 (will be set by layout engine later)
  color: "" (will be set by colorMap.js later)
  brightness: 0, size: 0 (will be set later)

Parse all paths and methods from rawJson.paths. Handle missing fields gracefully with empty string defaults. If rawJson is null or missing .paths, return { error: "Invalid OpenAPI spec", stars: [], ... }.

Also call constellationGroup(stars) to build the constellations array.
Also call mockFrequency(stars) to assign frequency to each star.

Import and call colorMap.getStarVisuals(star) to set color, brightness, and size on each star.
```

### `colorMap.js`

```
Write src/utils/colorMap.js.

Export a constant METHOD_COLORS object:
  GET: "#E8E8FF"
  POST: "#4A9EFF"
  PUT: "#FF9A3C"
  PATCH: "#FFD93D"
  DELETE: "#FF4D4D"
  HEAD: "#9B9B9B"
  OPTIONS: "#7B68EE"

Export a function getStarVisuals(star) that returns { color, brightness, size }:
- color: METHOD_COLORS[star.method] or "#FFFFFF" fallback
- brightness: clamp(star.frequency * 0.8 + 0.2, 0.2, 1.0) so even rare endpoints are somewhat visible
- size: lerp(1.0, 3.5, star.frequency) so high-frequency endpoints are bigger

Export hexToRgb(hex) that converts a hex color string like "#FF4D4D" to { r, g, b } in 0–1 range for use in Three.js buffer attributes.
```

### `mockFrequency.js`

```
Write src/utils/mockFrequency.js.

Export a function mockFrequency(stars) that mutates each star in place, assigning a random frequency value between 0.05 and 1.0.

Use a seeded random approach so the same spec always produces the same frequency values (use the star's id string as the seed via a simple hash function).

GET endpoints should generally have higher frequency than POST/DELETE. Apply a method weight multiplier: GET = 1.0, POST = 0.6, PUT = 0.4, PATCH = 0.5, DELETE = 0.2. Multiply the random value by the weight, then clamp to [0.05, 1.0].

Return the mutated stars array.
```

### `constellationGroup.js`

```
Write src/utils/constellationGroup.js.

Export a function constellationGroup(stars) that groups stars by their constellationId and returns a ConstellationGroup array.

Each ConstellationGroup has:
  id: string (the tag name or "ungrouped")
  label: string (capitalized tag name)
  starIds: string[] (ordered by the path hierarchy, e.g. /pets before /pets/{id})
  color: string (a soft hex color assigned per group — generate distinct soft colors by hashing the group id)
  centroid: { x: 0, y: 0, z: 0 } (will be computed after layout)

Sort starIds within each group: collection endpoints (/pets) before item endpoints (/pets/{id}), GET before POST before PUT before PATCH before DELETE.

Generate group colors by taking the group id, hashing it to a hue value (0–360), and returning an HSL color with saturation 60% and lightness 70% as a hex string.

Return the ConstellationGroup array sorted by group size descending (largest constellation first).
```

---

## Layout prompts

### `useStarLayout.js`

```
Write a React hook called useStarLayout in src/hooks/useStarLayout.js.

It takes a stars array (StarData[]) and returns a new array with x, y, z positions assigned to each star.

Use d3-force to run a force simulation:
- forceCenter at (0, 0)
- forceManyBody with strength -80 (repulsion)
- forceCollide with radius proportional to star.size * 3
- forceLink connecting stars within the same constellationId with distance 20 and strength 0.3

Run the simulation for 300 ticks (don't animate it — run all ticks synchronously on first call).

After simulation, spread positions to Three.js world space: multiply d3 x by 0.3 and y by 0.3. Assign z as a small random offset (±2) for slight depth variation.

After layout, compute centroid for each constellation group and update the centroid field.

Return the stars with positions set. Memoize with useMemo, only re-running when the stars array reference changes.
```

---

## Rendering prompts

### `StarField.jsx` (background atmosphere)

```
Write a React component StarField in src/components/Canvas/StarField.jsx using React Three Fiber.

Generate 2000 random background stars using Three.js Points geometry with a custom ShaderMaterial.

Import the shader strings from:
  import starVert from '../../shaders/star.vert?raw'
  import starFrag from '../../shaders/star.frag?raw'

For background stars:
- Positions: random in a sphere of radius 300, but with z constrained to ±20 (flat sky feel)
- aColor: near-white with slight random tint (RGB values between 0.7 and 1.0)
- aBrightness: random between 0.05 and 0.4 (these are background, not endpoints)
- aSize: random between 0.3 and 1.2
- aIsHovered, aIsSelected, aIsFiltered: all 1.0

Use useMemo to create geometry and material once.
Use useFrame to increment uTime uniform each frame.

The component receives no props.
```

### `EndpointStar.jsx`

```
Write a React component EndpointStar in src/components/Canvas/EndpointStar.jsx using React Three Fiber.

It receives props: stars (StarData[]), hoveredStarId (string|null), selectedStarId (string|null).

Create a single Three.js Points geometry with these buffer attributes for all stars:
  position (Float32Array, 3 per star)
  aColor (Float32Array, 3 per star — use hexToRgb from colorMap.js)
  aBrightness (Float32Array, 1 per star)
  aSize (Float32Array, 1 per star)
  aIsHovered (Float32Array, 1 per star — 1.0 if star.id === hoveredStarId)
  aIsSelected (Float32Array, 1 per star — 1.0 if star.id === selectedStarId)
  aIsFiltered (Float32Array, 1 per star — always 1.0 for now)

Import and use star.vert and star.frag shaders.

Use useMemo to create geometry when stars changes.
Use useEffect to update ONLY the aIsHovered, aIsSelected, aIsFiltered attributes (and call needsUpdate = true) when hoveredStarId or selectedStarId changes — don't rebuild geometry for hover.

Use useFrame to increment uTime uniform.

Important: set depthWrite: false and transparent: true on the ShaderMaterial.
```

### `Constellation.jsx`

```
Write a React component Constellation in src/components/Canvas/Constellation.jsx using React Three Fiber.

It receives props: constellations (ConstellationGroup[]), stars (StarData[]).

For each constellation group, render a LineSegments geometry connecting the stars in order (star[0]→star[1], star[1]→star[2], etc. — not fully connected).

Lines should be transparent (opacity 0.2) and use the constellation's color.

Also render a text label at the constellation's centroid using <Text> from @react-three/drei. Label should be the constellation name in white, font size 1.5, opacity 0.5.

Memoize geometries with useMemo, rebuilding only when constellations or stars change.
```

---

## Interaction prompts

### `useStarInteraction.js`

```
Write a React hook useStarInteraction in src/hooks/useStarInteraction.js.

It takes pointsRef (a React ref to the Three.js Points object) and stars (StarData[]).

Returns { hoveredStarId, selectedStarId, handlePointerMove, handleClick }.

On pointer move over the canvas:
- Use Three.js Raycaster to find the closest point in the Points geometry within a threshold of 2 world units
- Update hoveredStarId to that star's id, or null if nothing is close

On click:
- If hoveredStarId is not null, set selectedStarId to hoveredStarId
- If the click hits empty space (no hovered star), set selectedStarId to null

Update document.body.style.cursor to "pointer" when hovering a star, "default" otherwise.

Use useCallback for the handlers. Use useRef for the raycaster to avoid recreating it.
```

### `StarPanel.jsx`

```
Write a React component StarPanel in src/components/UI/StarPanel.jsx.

It receives props: star (StarData | null), onClose (function).

When star is null, render nothing (return null).

When star is provided, render a fixed panel on the right side of the screen (width 380px, full height, dark background #0A0A1A, border-left 1px solid rgba(255,255,255,0.1)).

Panel content:
1. Header: method badge (colored pill using METHOD_COLORS), path in monospace, close button
2. Summary text and description
3. Parameters section: table with columns Name, In, Required, Type, Description
4. Request body section (only for POST/PUT/PATCH): shows content type and schema as formatted JSON
5. Responses section: list of status codes with colored badges (green=2xx, amber=3xx, red=4xx/5xx) and descriptions
6. A "Try it" button at the bottom (placeholder for Phase 9)

Animate the panel sliding in from the right using CSS transform translateX, transitioning over 200ms.

Use white/gray text on the dark background. This panel is outside the Three.js canvas.
```

---

## Filter and search prompts

### `FilterBar.jsx`

```
Write a React component FilterBar in src/components/Controls/FilterBar.jsx.

It renders a horizontal row of toggle buttons for each HTTP method: GET, POST, PUT, PATCH, DELETE.

Each button shows the method name and a small colored dot using METHOD_COLORS.
Active methods have a white border. Inactive methods are dimmed (opacity 0.4).

On click, call toggleMethodFilter from the Zustand store.

Position the bar as a fixed overlay at the bottom-center of the screen with a dark semi-transparent background.
```

### `SearchBar.jsx`

```
Write a React component SearchBar in src/components/UI/SearchBar.jsx.

It renders a text input styled as a dark search box, positioned as a fixed overlay at the top-center of the screen.

On change, call setSearchQuery from the Zustand store with a 150ms debounce.

Show a subtle placeholder: "Search endpoints...".
Show a clear button (×) when the search has content.
On Escape key, clear the search.
```

---

## Camera prompts

### `useCamera.js`

```
Write a React hook useCamera in src/hooks/useCamera.js for use with React Three Fiber.

It returns { cameraRef, handlePointerDown, handlePointerMove, handlePointerUp, handleWheel }.

Pan behavior:
- On pointer down, record the start position and set isDragging = true
- On pointer move while dragging, compute delta and translate camera.position.x and camera.position.y
- On pointer up, set isDragging = false
- Drag sensitivity: multiply pixel delta by 0.05

Zoom behavior:
- On wheel event, move camera.position.z by event.deltaY * 0.05
- Clamp camera.position.z between 15 and 250

All camera movements should lerp toward the target position at speed 0.12 per frame using useFrame.

Also export a flyToStar(position) function that sets cameraTarget to [position.x, position.y, camera.position.z - 30] and animates camera there over ~60 frames.
```

---

## Polish prompts

### `Legend.jsx`

```
Write a React component Legend in src/components/UI/Legend.jsx.

Render a small fixed overlay at the bottom-left of the screen showing the HTTP method color key.

For each method in METHOD_COLORS, show a colored circle and the method name in small white text.

Style: dark semi-transparent background, rounded corners, compact (no wasted space). Font size 12px.
```

### `LoadingNebula.jsx`

```
Write a React component LoadingNebula in src/components/UI/LoadingNebula.jsx.

When a spec is being parsed (show when isLoading prop is true), render a full-screen dark overlay with a centered animation.

The animation should be a canvas-based or CSS-based nebula effect: a softly pulsing circular gradient in deep purple and blue, with the text "Mapping the universe..." below it.

Fade in and out smoothly using CSS opacity transition.
```

### Keyboard shortcuts

```
In App.jsx, add a useEffect that registers these keyboard shortcuts:
- Escape: call setSelected(null) from the Zustand store (deselects current star)
- / (forward slash): focus the search input (find it by calling document.querySelector('#search-input'))
- R: call resetCamera() from the Zustand store
- F: cycle through method filters one at a time

Log a message to console when shortcuts are registered. Remove event listeners on cleanup.
```

---

## Zustand store prompt

### `store.js`

```
Create src/store.js using Zustand.

The store should have this shape (see DATA_MODEL.md for full type definitions):

State:
  stars: []
  constellations: []
  apiTitle: ""
  baseUrl: ""
  hoveredStarId: null
  selectedStarId: null
  activeMethodFilters: new Set(["GET", "POST", "PUT", "PATCH", "DELETE"])
  searchQuery: ""
  cameraTarget: [0, 0, 80]
  zoomLevel: 80
  isLoading: false

Computed (derive in selectors, not state):
  filteredStars: stars filtered by activeMethodFilters and searchQuery
  selectedStar: stars.find(s => s.id === selectedStarId) or null

Actions:
  loadSpec(parsedResult) — sets stars, constellations, apiTitle, baseUrl, sets isLoading to false
  setLoading(bool)
  setHovered(id)
  setSelected(id)
  toggleMethodFilter(method) — adds to Set if absent, removes if present
  setSearchQuery(q)
  flyToStar(id) — sets cameraTarget to that star's position with z offset -30
  resetCamera() — sets cameraTarget back to [0, 0, 80]

For filteredStars: a star passes the filter if its method is in activeMethodFilters AND (searchQuery is empty OR star.path or star.summary includes searchQuery case-insensitively).
```

---

## Debugging prompts

### If stars don't appear

```
My Three.js Points geometry is not rendering any stars. The component is mounted and the stars array has data. Here is my EndpointStar.jsx: [paste your code]. What is wrong? Check for: missing buffer attribute sizes, wrong attribute names vs shader variable names, transparent material with depthWrite not set, incorrect shader import path, missing useFrame for uTime.
```

### If D3 layout produces all stars at origin

```
My useStarLayout hook returns all stars with x=0, y=0. I'm using d3-force. The simulation runs but positions don't update. Here is my hook: [paste code]. Most likely cause: d3 simulation mutates the nodes array directly — I might be spreading or copying nodes incorrectly. Show me the fix.
```

### If constellation lines don't connect correctly

```
My Constellation.jsx LineSegments geometry doesn't draw lines between the correct stars. I'm using constellationGroup.starIds to look up star positions. Here is the code: [paste]. Check that I'm building the positions array correctly for LineSegments (each line needs 2 vertices: start then end, not a continuous strip).
```
