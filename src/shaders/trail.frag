// Trail fragment shader
// Animated traveling light effect

uniform float uTime;

varying vec3 vColor;

void main() {
  // TWEAK: Adjust wave speed
  float wave = sin(vUv.x * 10.0 - uTime * 3.0) * 0.5 + 0.5;
  float alpha = wave * (1.0 - vUv.x);
  
  gl_FragColor = vec4(vColor, alpha);
}
