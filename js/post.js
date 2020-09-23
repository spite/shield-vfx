import {
  RawShaderMaterial,
  Vector2,
  RGBAFormat,
  FloatType,
  HalfFloatType,
} from "../third_party/three.module.js";
import { ShaderPass } from "./ShaderPass.js";
import { ShaderPingPongPass } from "./ShaderPingPongPass.js";
import { shader as orthoVs } from "../shaders/ortho-vs.js";
import { shader as blurFs } from "../shaders/blur-fs.js";
import { shader as highlightFs } from "../shaders/highlight-fs.js";
import { shader as combineFs } from "../shaders/combine-fs.js";

const blurShader = new RawShaderMaterial({
  uniforms: {
    inputTexture: { value: null },
    resolution: { value: new Vector2(1, 1) },
    direction: { value: new Vector2(0, 1) },
  },
  vertexShader: orthoVs,
  fragmentShader: blurFs,
});

const highlightShader = new RawShaderMaterial({
  uniforms: {
    inputTexture: { value: null },
    resolution: { value: new Vector2(1, 1) },
    direction: { value: new Vector2(0, 1) },
  },
  vertexShader: orthoVs,
  fragmentShader: highlightFs,
});

const combineShader = new RawShaderMaterial({
  uniforms: {
    inputTexture: { value: null },
    resolution: { value: new Vector2(1, 1) },
    direction: { value: new Vector2(0, 1) },
  },
  vertexShader: orthoVs,
  fragmentShader: combineFs,
});

class Post {
  constructor(renderer) {
    this.renderer = renderer;

    this.highlight = new ShaderPass(this.renderer, highlightShader);
    this.combine = new ShaderPass(this.renderer, combineShader);

    this.blurStrength = 1;
    this.blurPasses = [];
    this.levels = 5;
    for (let i = 0; i < this.levels; i++) {
      const blurPass = new ShaderPingPongPass(this.renderer, blurShader, {
        format: RGBAFormat,
        type: FloatType, //canDoFloatLinear() ? FloatType : HalfFloatType,
      });
      this.blurPasses.push(blurPass);
    }
  }

  setSize(w, h) {
    blurShader.uniforms.resolution.value.set(w, h);
    this.highlight.setSize(w, h);

    let tw = w;
    let th = h;
    for (let i = 0; i < this.levels; i++) {
      tw /= 2;
      th /= 2;
      tw = Math.round(tw);
      th = Math.round(th);
      this.blurPasses[i].setSize(tw, th);
    }
  }

  render() {
    this.highlight.render();

    let offset = this.blurStrength;
    blurShader.uniforms.inputTexture.value = this.highlight.fbo.texture;
    for (let j = 0; j < this.levels; j++) {
      blurShader.uniforms.direction.value.set(offset, 0);
      const blurPass = this.blurPasses[j];
      const w = blurPass.fbo.width;
      const h = blurPass.fbo.height;
      blurShader.uniforms.resolution.value.set(w, h);
      blurPass.render();
      blurShader.uniforms.inputTexture.value =
        blurPass.fbos[blurPass.currentFBO].texture;
      blurShader.uniforms.direction.value.set(0, offset);
      blurPass.render();
      blurShader.uniforms.inputTexture.value =
        blurPass.fbos[blurPass.currentFBO].texture;
    }

    this.combine.render(true);
  }
}

export { Post };
