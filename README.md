# API Constellation 🌌

> Visualize your REST API as a navigable night sky — every endpoint a star, every relationship a constellation.

---

## What is this?

API Constellation takes an OpenAPI/Swagger JSON spec and renders it as an interactive WebGL night sky in the browser.

- Every **endpoint** is a **star**
- **Brightness** = call frequency (from usage data or mock weights)
- **Color** = HTTP method (GET = white, POST = blue, DELETE = red, PATCH = amber, PUT = orange)
- **Constellations** = groups of related endpoints (same resource/tag)
- **Light trails** = animated lines showing request flow between endpoints
- **Clicking a star** = opens a full docs panel + live test console

No backend required. Pure frontend. Drop in a JSON file and explore.

---

## Folder structure

```
api-constellation/
├── public/
│   └── sample-specs/
│       ├── petstore.json          # Sample OpenAPI spec for demo
│       └── github-api.json        # Larger real-world spec
├── src/
│   ├── main.jsx                   # App entry point
│   ├── App.jsx                    # Root component + layout
│   ├── components/
│   │   ├── Canvas/
│   │   │   ├── StarField.jsx      # Background static stars (atmosphere)
│   │   │   ├── EndpointStar.jsx   # Individual endpoint rendered as star
│   │   │   ├── Constellation.jsx  # Lines connecting related endpoints
│   │   │   ├── LightTrail.jsx     # Animated request flow trails
│   │   │   └── Scene.jsx          # Three.js scene setup + camera
│   │   ├── UI/
│   │   │   ├── DropZone.jsx       # Drag-and-drop JSON upload
│   │   │   ├── StarPanel.jsx      # Sidebar: endpoint details + test console
│   │   │   ├── Legend.jsx         # HTTP method color key
│   │   │   ├── SearchBar.jsx      # Filter/highlight endpoints by name
│   │   │   └── LoadingNebula.jsx  # Loading animation while parsing
│   │   └── Controls/
│   │       ├── ZoomControls.jsx   # +/- zoom buttons
│   │       └── FilterBar.jsx      # Toggle methods on/off
│   ├── hooks/
│   │   ├── useOpenAPIParser.js    # Parses OpenAPI JSON into star data
│   │   ├── useThreeScene.js       # Three.js scene lifecycle
│   │   ├── useStarLayout.js       # D3 force layout → star positions
│   │   ├── useCamera.js           # Pan/zoom camera controls
│   │   └── useStarInteraction.js  # Raycasting for click/hover on stars
│   ├── utils/
│   │   ├── colorMap.js            # HTTP method → color constants
│   │   ├── parseOpenAPI.js        # OpenAPI → internal star data model
│   │   ├── constellationGroup.js  # Grouping algorithm for constellations
│   │   └── mockFrequency.js       # Generates fake call frequency weights
│   ├── shaders/
│   │   ├── star.vert              # Vertex shader for star glow
│   │   ├── star.frag              # Fragment shader: twinkle + brightness
│   │   └── trail.frag             # Fragment shader: animated light trails
│   └── styles/
│       ├── global.css
│       └── panel.css
├── .github/
│   └── copilot-instructions.md    # Copilot workspace instructions
├── AGENTS.md                      # Copilot agent-mode build instructions
├── PROMPTS.md                     # Ready-to-paste Copilot prompt library
├── ARCHITECTURE.md                # System design deep-dive
├── DATA_MODEL.md                  # Data shapes and type contracts
├── SHADERS.md                     # GLSL shader guide for Copilot
└── MILESTONES.md                  # Phased build plan
```

---

## Quick start (after scaffolding)

```bash
npm create vite@latest api-constellation -- --template react
cd api-constellation
npm install three @react-three/fiber @react-three/drei d3 openapi-types
npm run dev
```

---

## The build order

Follow `MILESTONES.md` exactly — each phase produces something you can see and demo. Never skip a phase.

1. Static star field (atmosphere only)
2. Parse OpenAPI → place endpoint stars
3. Color + brightness per method/frequency
4. Constellation lines between related stars
5. Camera pan + zoom
6. Click → sidebar panel
7. Animated light trails
8. Search + filter
9. Live test console
10. Polish + deploy

---

## Key design decisions

| Decision | Choice | Why |
|---|---|---|
| Renderer | Three.js via R3F | Easiest Three.js + React integration |
| Layout engine | D3 force simulation | Natural clustering with repulsion |
| Star geometry | `Points` + custom shader | Cheaper than meshes, better glow |
| State management | Zustand | Minimal boilerplate for this scale |
| Spec parsing | Custom util + openapi-types | Full control over the data model |
| No backend | Intentional | Pure frontend = easy deploy + no auth |
