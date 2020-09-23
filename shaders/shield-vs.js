const shader = `#version 300 es

precision highp float;

in vec3 position;
in vec3 normal;
in vec2 uv;

uniform vec2 resolution;
uniform mat3 normalMatrix;
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

out vec2 vUv;
out float vRim;
out float vDepth;
out float vY;
out vec3 vPosition;

void main() {
  vUv = uv;
  vec3 n = normalMatrix * normal;
  vec4 viewPosition = modelViewMatrix * vec4( position, 1. );
  vec3 eye = normalize(-viewPosition.xyz);
  vRim = 1.0 - abs(dot(eye,n));
  vRim = pow(vRim, 5.);
  vY = position.y;
  vPosition = position;
  vec3 worldPosition = (modelMatrix * vec4(position, 1.)).xyz;  
  gl_Position = projectionMatrix * viewPosition;
  vDepth = gl_Position.z;
}
`;

export { shader };
