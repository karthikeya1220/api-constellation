# Data model

All internal data shapes used across the project. Copilot should use these types verbatim — never invent new field names.

---

## Core types

### `StarData`

The primary unit. One `StarData` object per API endpoint.

```ts
interface StarData {
  id: string;                  // Unique: "{method}:{path}" e.g. "GET:/pets/{id}"
  method: HttpMethod;          // "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  path: string;                // Raw OpenAPI path e.g. "/pets/{id}"
  summary: string;             // Short description from OpenAPI operationId or summary
  description: string;         // Full description from OpenAPI
  tags: string[];              // OpenAPI tags array — drives constellation grouping
  parameters: StarParameter[]; // Path + query params
  requestBody: StarBody | null;
  responses: StarResponse[];
  frequency: number;           // 0.0 – 1.0, call frequency weight (real or mocked)
  constellationId: string;     // Which constellation this star belongs to (derived from tags[0])

  // Assigned by layout engine (after D3 simulation)
  x: number;
  y: number;
  z: number;

  // Derived visual properties (assigned by colorMap.js)
  color: string;               // Hex color for this method
  brightness: number;          // 0.2 – 1.0, derived from frequency
  size: number;                // Point size in shader units, derived from frequency
}
```

### `HttpMethod`

```ts
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
```

### `StarParameter`

```ts
interface StarParameter {
  name: string;
  in: "path" | "query" | "header" | "cookie";
  required: boolean;
  description: string;
  schema: {
    type: string;          // "string" | "integer" | "boolean" etc.
    example?: unknown;
  };
}
```

### `StarBody`

```ts
interface StarBody {
  required: boolean;
  contentType: string;   // e.g. "application/json"
  schema: object;        // Raw JSON Schema — passed as-is to the test console
  example?: object;
}
```

### `StarResponse`

```ts
interface StarResponse {
  statusCode: string;    // "200" | "404" | "default" etc.
  description: string;
  contentType?: string;
  schema?: object;
}
```

### `ConstellationGroup`

```ts
interface ConstellationGroup {
  id: string;           // Same as tags[0] from the endpoints, or "ungrouped"
  label: string;        // Display name
  starIds: string[];    // Ordered list of star IDs in this group
  color: string;        // Hex color for constellation lines (lighter than star colors)
  centroid: {           // Center point of the group (average of member positions)
    x: number;
    y: number;
    z: number;
  };
}
```

### `ParseResult`

Returned by `parseOpenAPI(json)`:

```ts
interface ParseResult {
  stars: StarData[];
  constellations: ConstellationGroup[];
  apiTitle: string;
  apiVersion: string;
  baseUrl: string;
  totalEndpoints: number;
  error: string | null;
}
```

---

## Color map

Defined in `src/utils/colorMap.js`. These are the canonical hex values — never change them without updating the Legend component too.

```js
export const METHOD_COLORS = {
  GET:     "#E8E8FF",   // near-white blue — most common, should feel ambient
  POST:    "#4A9EFF",   // bright blue
  PUT:     "#FF9A3C",   // orange
  PATCH:   "#FFD93D",   // amber
  DELETE:  "#FF4D4D",   // red
  HEAD:    "#9B9B9B",   // gray
  OPTIONS: "#7B68EE",   // medium purple
};

export const METHOD_GLOW_COLORS = {
  GET:     "#AAAAFF",
  POST:    "#2277DD",
  PUT:     "#CC6600",
  PATCH:   "#BB9900",
  DELETE:  "#CC0000",
  HEAD:    "#666666",
  OPTIONS: "#5544CC",
};
```

---

## Zustand store

```ts
interface ConstellationStore {
  // Data
  stars: StarData[];
  constellations: ConstellationGroup[];
  apiTitle: string;
  baseUrl: string;

  // Selection state
  hoveredStarId: string | null;
  selectedStarId: string | null;

  // Filter state
  activeMethodFilters: Set<HttpMethod>;   // Methods currently visible
  searchQuery: string;                    // Highlight matching stars

  // Camera
  cameraTarget: [number, number, number];
  zoomLevel: number;

  // Derived (computed from above)
  filteredStars: StarData[];              // stars filtered by activeMethodFilters + searchQuery
  selectedStar: StarData | null;          // shortcut: stars.find(s => s.id === selectedStarId)

  // Actions
  loadSpec: (json: object) => void;
  setHovered: (id: string | null) => void;
  setSelected: (id: string | null) => void;
  toggleMethodFilter: (method: HttpMethod) => void;
  setSearchQuery: (q: string) => void;
  flyToStar: (id: string) => void;
  resetCamera: () => void;
}
```

---

## Three.js buffer attribute layout

The `Points` geometry uses these buffer attributes. The vertex shader reads them by name — don't rename.

| Attribute | Type | Per | Description |
|---|---|---|---|
| `position` | `Float32Array` | vertex | x, y, z world position |
| `aColor` | `Float32Array` | vertex | r, g, b (0–1 range) |
| `aBrightness` | `Float32Array` | vertex | 0.0–1.0 intensity |
| `aSize` | `Float32Array` | vertex | point size in units |
| `aIsHovered` | `Float32Array` | vertex | 0.0 or 1.0 flag |
| `aIsSelected` | `Float32Array` | vertex | 0.0 or 1.0 flag |
| `aIsFiltered` | `Float32Array` | vertex | 0.0 = hidden, 1.0 = visible |

These arrays are populated from `StarData[]` in `EndpointStar.jsx` using `useMemo`, and updated (not rebuilt) when hover/selection state changes.
