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
