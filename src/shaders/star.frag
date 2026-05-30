// Star fragment shader
// Twinkle effect + brightness multiplier

uniform float uTime;

varying vec3 vColor;
varying float vBrightness;
varying float vIsHovered;

void main() {
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);
  
  if (dist > 0.5) discard;
  
  float twinkle = sin(uTime * 3.0) * 0.3 + 0.7;
  float brightness = vBrightness * twinkle * (1.0 - dist * dist);
  
  if (vIsHovered > 0.5) {
    brightness = brightness * 2.0 + 0.5;
  }
  
  gl_FragColor = vec4(vColor * brightness, brightness);
}
