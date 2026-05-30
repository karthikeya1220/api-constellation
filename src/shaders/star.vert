// Star vertex shader
// Renders stars with glow effect

uniform float uTime;
uniform float uPixelRatio;

attribute float aBrightness;
attribute float aIsHovered;
attribute vec3 aColor;

varying vec3 vColor;
varying float vBrightness;
varying float vIsHovered;

void main() {
  vColor = aColor;
  vBrightness = aBrightness;
  vIsHovered = aIsHovered;

  gl_PointSize = (5.0 + aIsHovered * 3.0) * uPixelRatio;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
