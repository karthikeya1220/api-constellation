# Shaders

All GLSL shader code for API Constellation. Copilot should generate these files verbatim and then modify only the values marked `// TWEAK`.

---

## Overview

| File | Purpose |
|---|---|
| `src/shaders/star.vert` | Positions each star point, sets size based on brightness |
| `src/shaders/star.frag` | Draws the circular glow disc with twinkle animation |
| `src/shaders/trail.frag` | Animated dashed-line effect for light trail tubes |

These are used as raw GLSL strings imported into Three.js `ShaderMaterial`. In Vite, import them as:

```js
import starVert from './shaders/star.vert?raw';
import starFrag from './shaders/star.frag?raw';
```

---

## `star.vert` — Star vertex shader

```glsl
uniform float uTime;
uniform float uPixelRatio;

attribute vec3 aColor;
attribute float aBrightness;
attribute float aSize;
attribute float aIsHovered;
attribute float aIsSelected;
attribute float aIsFiltered;

varying vec3 vColor;
varying float vBrightness;
varying float vIsHovered;
varying float vIsSelected;
varying float vIsFiltered;

void main() {
  vColor = aColor;
  vBrightness = aBrightness;
  vIsHovered = aIsHovered;
  vIsSelected = aIsSelected;
  vIsFiltered = aIsFiltered;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  // Twinkle: subtle brightness oscillation per star using position as seed
  float twinkleSpeed = 1.5;                          // TWEAK: animation speed
  float twinkleAmount = 0.15;                        // TWEAK: how much twinkle (0 = none)
  float twinkle = sin(uTime * twinkleSpeed + position.x * 13.7 + position.y * 7.3) * twinkleAmount + 1.0;

  float baseSize = aSize * uPixelRatio * 4.0;        // TWEAK: global star size multiplier
  float hoverBoost = 1.0 + aIsHovered * 1.5;        // TWEAK: hover size multiplier
  float selectedBoost = 1.0 + aIsSelected * 2.0;    // TWEAK: selected size multiplier

  gl_PointSize = baseSize * twinkle * hoverBoost * selectedBoost;
  gl_Position = projectionMatrix * mvPosition;
}
```

---

## `star.frag` — Star fragment shader

```glsl
varying vec3 vColor;
varying float vBrightness;
varying float vIsHovered;
varying float vIsSelected;
varying float vIsFiltered;

void main() {
  // Hide filtered-out stars
  if (vIsFiltered < 0.5) discard;

  // Distance from center of point sprite (0 = center, 1 = edge)
  vec2 uv = gl_PointCoord - vec2(0.5);
  float dist = length(uv) * 2.0;

  if (dist > 1.0) discard;

  // Soft circular glow disc
  float core = 1.0 - smoothstep(0.0, 0.3, dist);       // TWEAK: core radius
  float glow = 1.0 - smoothstep(0.2, 1.0, dist);       // TWEAK: glow falloff
  float alpha = core * 0.95 + glow * 0.4;              // TWEAK: opacity mix

  // Boost brightness on hover/select
  float brightBoost = 1.0 + vIsHovered * 0.4 + vIsSelected * 0.6;
  float finalBrightness = clamp(vBrightness * brightBoost, 0.0, 1.0);

  // Hovered stars get a white core
  vec3 coreColor = mix(vColor, vec3(1.0), vIsHovered * 0.5);

  // Selected stars get a ring outline effect (brighter at edge of core)
  float ring = smoothstep(0.25, 0.3, dist) * (1.0 - smoothstep(0.3, 0.35, dist));
  vec3 finalColor = coreColor + vec3(ring * vIsSelected * 0.8);

  gl_FragColor = vec4(finalColor * finalBrightness, alpha * finalBrightness);
}
```

---

## `trail.frag` — Light trail fragment shader

Applied to `TubeGeometry` meshes representing request flow trails.

```glsl
uniform float uTime;
uniform vec3 uColor;
uniform float uSpeed;    // TWEAK: how fast the light travels
uniform float uDensity;  // TWEAK: how many light pulses on the trail at once

varying vec2 vUv;

void main() {
  // Animate dashes travelling along the trail (U axis = along tube length)
  float dash = fract(vUv.x * uDensity - uTime * uSpeed);

  // Smooth dash pulse (0 = off, 1 = on)
  float pulse = smoothstep(0.0, 0.15, dash) * (1.0 - smoothstep(0.6, 1.0, dash));

  // Fade at the edges of the tube cross-section (V axis = around tube)
  float edgeFade = 1.0 - abs(vUv.y * 2.0 - 1.0);
  edgeFade = smoothstep(0.0, 0.5, edgeFade);

  float alpha = pulse * edgeFade * 0.7;             // TWEAK: overall trail opacity

  gl_FragColor = vec4(uColor, alpha);
}
```

---

## How to wire shaders into Three.js (R3F)

```jsx
import { useMemo } from 'react';
import { ShaderMaterial, Float32BufferAttribute, BufferGeometry, Points } from 'three';
import { useFrame } from '@react-three/fiber';
import starVert from '../../shaders/star.vert?raw';
import starFrag from '../../shaders/star.frag?raw';

export function EndpointStar({ stars }) {
  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const positions = new Float32Array(stars.length * 3);
    const colors = new Float32Array(stars.length * 3);
    // ... fill arrays from stars data ...
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geo.setAttribute('aColor', new Float32BufferAttribute(colors, 3));
    // ... other attributes ...
    return geo;
  }, [stars]);

  const material = useMemo(() => new ShaderMaterial({
    vertexShader: starVert,
    fragmentShader: starFrag,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: window.devicePixelRatio },
    },
    transparent: true,
    depthWrite: false,
  }), []);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
  });

  return <points geometry={geometry} material={material} />;
}
```

---

## Troubleshooting common shader issues

| Symptom | Likely cause | Fix |
|---|---|---|
| Stars are squares, not circles | `discard` not working | Check that `gl_PointCoord` is available — it requires `sizeAttenuation: true` on the material |
| All stars same size | `aSize` attribute not bound | Confirm `geo.setAttribute('aSize', ...)` was called before scene mount |
| Trails not animating | `uTime` uniform not updated | Confirm `useFrame` is updating `material.uniforms.uTime.value` each frame |
| Stars disappear when filtering | `aIsFiltered` not updated | Call `geo.attributes.aIsFiltered.needsUpdate = true` after mutating the array |
| Glow looks pixelated | Low pixel ratio | Ensure `uPixelRatio` is set to `window.devicePixelRatio` not `1` |
