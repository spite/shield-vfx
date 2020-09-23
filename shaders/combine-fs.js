const shader = `#version 300 es

precision highp float;

uniform sampler2D inputTexture;

in vec2 vUv;

out vec4 color;

void main() {
  vec4 i = texture(inputTexture, vUv);
  color = i;//vec4(vec3(i.a), 1.);
}`;

export { shader };
