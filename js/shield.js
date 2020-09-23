import {
  IcosahedronBufferGeometry,
  Mesh,
  RawShaderMaterial,
  DoubleSide,
  Vector2,
} from "../third_party/three.module.js";
import { shader as shieldVertexShader } from "../shaders/shield-vs.js";
import { shader as shieldFragmentShader } from "../shaders/shield-fs.js";

class Shield {
  constructor() {
    this.material = new RawShaderMaterial({
      uniforms: {
        depthBuffer: { value: null },
        resolution: { value: new Vector2(1, 1) },
        time: { value: 0 },
      },
      vertexShader: shieldVertexShader,
      fragmentShader: shieldFragmentShader,
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
    });

    this.mesh = new Mesh(new IcosahedronBufferGeometry(0.5, 5), this.material);
  }
}

export { Shield };
