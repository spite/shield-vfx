const shader = `#version 300 es

precision highp float;

uniform sampler2D inputTexture;

in vec2 vUv;

out vec4 color;

void main() {
  color = texture(inputTexture, vUv);
  color = vec4(1.,0.,1.,1.);
}`;

export { shader };
