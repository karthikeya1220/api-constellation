// Trail fragment shader
// Animated traveling light effect

uniform float uTime;
uniform vec3 uColor;
uniform float uSpeed;
uniform float uDensity;

varying vec2 vUv;

void main() {
  // TWEAK: Adjust wave speed for traveling dashes
  float wave = sin(vUv.x * uDensity - uTime * uSpeed) * 0.5 + 0.5;
  float alpha = wave * (1.0 - vUv.x);
  
  gl_FragColor = vec4(uColor, alpha * 0.6);
}
