/**
 * Calibrated WebGL Shaders for FedCausalFreshNet Holographic Digital Twin.
 * Delivers crisp, luminous particle clouds with soft gaussian cores,
 * delicate fiber streamlines, and bioluminescent highlights without over-blooming.
 */

export const ProduceParticleShader = {
  vertexShader: `
    uniform float uTime;
    uniform float uHoveredItemIndex; // index of currently hovered item, or -1

    attribute float aSize;
    attribute float aPhase;
    attribute float aItemIndex;

    varying vec3 vColor;
    varying float vAlpha;
    varying float vHovered;

    void main() {
      vColor = color;
      vHovered = 0.0;

      // Subtle biological oscillation wave
      float pulse = sin(uTime * 2.8 + aPhase) * 0.5 + 0.5;
      float sizeBoost = pulse * 0.15;

      if (uHoveredItemIndex >= 0.0 && abs(aItemIndex - uHoveredItemIndex) < 0.1) {
        vHovered = 1.0;
        sizeBoost += 0.45;
      }

      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      float finalSize = aSize * (1.0 + sizeBoost);
      
      // Perspective point size attenuation
      gl_PointSize = finalSize * (260.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    varying vec3 vColor;
    varying float vHovered;

    void main() {
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      if (dist > 0.5) discard;

      // Soft gaussian radiant core + smooth edge falloff
      float core = 1.0 - smoothstep(0.0, 0.22, dist);
      float aura = 1.0 - smoothstep(0.15, 0.50, dist);
      
      // Luminous white-hot center mixed with base color
      vec3 finalColor = mix(vColor, vec3(1.0, 1.0, 1.0), core * 0.7);
      if (vHovered > 0.5) {
        finalColor = mix(finalColor, vec3(0.4, 0.9, 1.0), 0.35);
      }

      float alpha = core * 0.95 + aura * 0.55;
      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
};

export const VaporStreamlineShader = {
  vertexShader: `
    uniform float uTime;
    attribute float aLife;
    attribute float aSpeed;

    varying float vLife;

    void main() {
      vLife = aLife;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = 2.4 * (220.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    varying float vLife;

    void main() {
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      if (dist > 0.5) discard;

      float core = 1.0 - smoothstep(0.0, 0.35, dist);
      vec3 vaporColor = vec3(0.22, 0.74, 0.97); // Cyan ice vapor

      gl_FragColor = vec4(vaporColor, core * 0.45 * vLife);
    }
  `,
};

