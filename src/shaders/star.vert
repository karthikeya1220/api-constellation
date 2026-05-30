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
