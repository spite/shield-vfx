import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  Mesh,
  MeshNormalMaterial,
  OrthographicCamera,
  DirectionalLight,
  HemisphereLight,
  Vector3,
  Color,
  Raycaster,
  PCFSoftShadowMap,
  sRGBEncoding,
  BufferGeometry,
  Matrix4,
  BufferAttribute,
  Vector2,
  IcosahedronBufferGeometry,
  RawShaderMaterial,
  BoxBufferGeometry,
  MeshStandardMaterial,
  RGBAFormat,
  UnsignedByteType,
  TorusKnotBufferGeometry,
  PointLight,
  FloatType,
} from "../third_party/three.module.js";
import { OrbitControls } from "../third_party/OrbitControls.js";
import { Shield } from "./shield.js";

import { getFBO } from "./FBO.js";
import { ShaderPass } from "./ShaderPass.js";
import { ShaderPingPongPass } from "./ShaderPingPongPass.js";
import { OBJLoader } from "../third_party/OBJLoader.js";
import { SubdivisionModifier } from "../third_party/SubdivisionModifier.js";
//import { Post } from "./post.js";

import { shader as depthVertexShader } from "../shaders/depth-vs.js";
import { shader as depthFragmentShader } from "../shaders/depth-fs.js";

const canvas = document.querySelector("canvas");
const status = document.querySelector("#status");

const renderer = new WebGLRenderer({
  antialias: true,
  alpha: true,
  canvas,
  preserveDrawingBuffer: false,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0, 1);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
renderer.outputEncoding = sRGBEncoding;
renderer.gammaFactor = 2.2;

//const post = new Post(renderer);

document.body.append(renderer.domElement);

const scene = new Scene();
const camera = new PerspectiveCamera(60, 1, 0.1, 10);
camera.position.set(1, 1, 2);

const controls = new OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;

const raycaster = new Raycaster();
const mouse = new Vector2();

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
window.addEventListener("mousemove", onMouseMove, false);

const palette = [
  "#CA0045",
  "#052269",
  "#FFC068",
  "#114643",
  "#9BC2B5",
  "#CE8D3D",
  "#BD3E30",
];

const up = new Vector3(0, 1, 0);

const depthMaterial = new RawShaderMaterial({
  uniforms: {},
  vertexShader: depthVertexShader,
  fragmentShader: depthFragmentShader,
});
const mat = new MeshStandardMaterial({
  color: 0xbd3e30,
  roughness: 0.4,
  metalness: 0.0,
});
const mesh = new Mesh(new TorusKnotBufferGeometry(0.5, 0.2, 200, 50), mat);
mesh.castShadow = mesh.receiveShadow = true;
//scene.add(mesh);

const mesh2 = new Mesh(new BoxBufferGeometry(0.5, 0.5, 0.5), mat);
mesh2.position.x = 1;
//scene.add(mesh2);

const intersectables = [];

const shield = new Shield();
shield.mesh.position.set(0.3, 0.4, 0.5);
mesh2.castShadow = mesh2.receiveShadow = true;
scene.add(shield.mesh);

async function loadModel(file) {
  return new Promise((resolve, reject) => {
    const loader = new OBJLoader();
    loader.load(file, resolve, null, reject);
  });
}

function mergeMesh(mesh) {
  let count = 0;
  mesh.traverse((m) => {
    if (m instanceof Mesh) {
      count += m.geometry.attributes.position.count;
    }
  });
  let geo = new BufferGeometry();
  const positions = new Float32Array(count * 3);
  count = 0;
  mesh.traverse((m) => {
    if (m instanceof Mesh) {
      const mat = new Matrix4().makeTranslation(
        m.position.x,
        m.position.y,
        m.position.z
      );
      m.geometry.applyMatrix4(mat);
      const pos = m.geometry.attributes.position;
      for (let j = 0; j < pos.count; j++) {
        positions[(count + j) * 3] = pos.array[j * 3];
        positions[(count + j) * 3 + 1] = pos.array[j * 3 + 1];
        positions[(count + j) * 3 + 2] = pos.array[j * 3 + 2];
      }
      count += pos.count;
    }
  });
  geo.setAttribute("position", new BufferAttribute(positions, 3));
  return geo;
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const dPR = window.devicePixelRatio;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  depth.setSize(width * dPR, height * dPR);
  hdr.setSize(width * dPR, height * dPR);
  shield.material.uniforms.resolution.value.set(width * dPR, height * dPR);
  //post.setSize(width * dPR, height * dPR);
}

const depth = getFBO(1, 1, {
  format: RGBAFormat,
  type: UnsignedByteType,
});

const hdr = getFBO(1, 1, {
  format: RGBAFormat,
  type: UnsignedByteType,
});

shield.material.uniforms.depthBuffer.value = depth.texture;

const point = new Vector3();
const normal = new Vector3();

function render() {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(intersectables);
  if (intersects.length) {
    point.copy(intersects[0].point);
    normal.copy(intersects[0].face.normal);
    normal.multiplyScalar(0.1);
    point.add(normal);
    const pos = shield.mesh.position.copy(point);
    spotLight.position.copy(point);
  }

  mesh.rotation.y = performance.now() * 0.0001;
  shield.material.uniforms.time.value = performance.now();

  scene.overrideMaterial = depthMaterial;
  shield.mesh.visible = false;
  scene.overrideMaterial = depthMaterial;
  renderer.setRenderTarget(depth);
  renderer.render(scene, camera);
  renderer.setRenderTarget(null);
  shield.mesh.visible = true;
  scene.overrideMaterial = null;
  //renderer.setRenderTarget(hdr);
  renderer.render(scene, camera);
  //renderer.setRenderTarget(null);

  //post.combine.shader.uniforms.inputTexture.value = hdr.texture;
  //post.render();

  renderer.setAnimationLoop(render);
}

const light = new DirectionalLight(0xffffff);
light.position.set(3, 6, 3);
light.castShadow = true;
light.shadow.camera.top = 2;
light.shadow.camera.bottom = -2;
light.shadow.camera.right = 2;
light.shadow.camera.left = -2;
light.shadow.bias = -0.00001;
light.shadow.mapSize.set(4096, 4096);
scene.add(light);

const hemiLight = new HemisphereLight(0xbbbbbb, 0x080808, 1);
scene.add(hemiLight);

const spotLight = new PointLight(0xa183ff, 1);
spotLight.castShadow = true;
spotLight.distance = 8;
spotLight.decay = 2;
spotLight.power = 40;
//scene.add(spotLight);

async function loadSuzanne() {
  const model = await loadModel("./assets/suzanne.obj");
  const geo = mergeMesh(model);
  // const geo = new TorusKnotBufferGeometry(10, 3, 100, 5);
  const modified = new SubdivisionModifier(3);
  const geo2 = new BufferGeometry().fromGeometry(modified.modify(geo));
  geo2.center();
  geo2.applyMatrix4(new Matrix4().makeScale(1, 1, 1));
  const suzanne = new Mesh(geo2, mat);
  scene.add(suzanne);
  suzanne.castShadow = suzanne.receiveShadow = true;
  intersectables.push(suzanne);
}

async function init() {
  await loadSuzanne();
  render();
}

window.addEventListener("resize", resize);

resize();
init();
