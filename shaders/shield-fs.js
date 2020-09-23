import { voronoise3d } from "./voronoise-3d.js";

const shader = `#version 300 es

precision highp float;

#include <packing>

uniform sampler2D depthBuffer;
uniform vec2 resolution;
uniform float time;

in float vRim;
in vec2 vUv;
in float vDepth;
in float vY;
in vec3 vPosition;

out vec4 color;

${voronoise3d}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec4 packedDepth = texture(depthBuffer, uv);
    float sceneDepth = unpackRGBAToDepth(packedDepth);
    float depth = (vDepth - .1) / ( 10.0 -.1);
    float diff = abs(depth - sceneDepth);
    float contact = diff * 20.;
    contact = 1. - contact;
    contact = max(contact, 0.);
    contact = pow(contact, 20.);
    contact *= diff*1000.;
    float a = max(contact, vRim);
    float stripe = 1. * (.5 + .5 * cos(20.*vY - 0.02 * time ));
    float noise = VoronoiseN3(vPosition * 5. + vec3(0., -.005 * time, 0.), vec3(4.));
    float noise2 = VoronoiseN3(vPosition * 10. + vec3(0., -.0025 * time, 0.), vec3(4.));
    noise = noise + noise2 + stripe;
    a = (.9 *a * noise + .1 * noise) + a;// + a;
    float fade = 1. - pow(vRim, 10.);
    color = vec4(uv*2., 1., a * fade);
}
`;

export { shader };
