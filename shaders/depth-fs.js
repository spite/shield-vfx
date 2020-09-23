const shader = `#version 300 es

precision highp float;

#include <packing>

in vec2 vUv;
in float vDepth;

out vec4 color;

void main() {
  float depth = (vDepth - .1) / ( 10.0 -.1);
  color = packDepthToRGBA(depth);
}
`;

export { shader };
