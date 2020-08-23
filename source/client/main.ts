import uplaodMeshToVAO from "./gl/uploadMeshToVAO";
import createMeshVAO from "./gl/createMeshVAO";
import combineMesh from "./mesh/combineMesh";
import createShader from "./gl/createShader";
import drawMeshVAO from "./gl/drawMeshVAO";
import createTex2D from "./gl/createTex2D";
import parseOBJ from "./mesh/parseOBJ";
import MeshData from "./mesh/MeshData";

// @ts-ignore
import { mat4, vec3 } from "https://unpkg.com/gl-matrix@3.3.0/esm/index.js";

function clamp(x: number, min: number, max: number) {
  return Math.max(min, Math.min(max, x));
}

(async () => {
  const data = await fetchText("./assets/meshes/cube.obj");
  const cube = parseOBJ(data);

  const display = document.querySelector("canvas")!;

  const gl = display.getContext("webgl2", {
    // alpha: false,
    antialias: false,
    depth: true,
    desynchronized: true,
  })!;

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  const shader = createShader(gl, debugVert, debugFrag);

  gl.useProgram(shader);

  const uTransform = gl.getUniformLocation(shader, "transform")!;
  const uAtlas = gl.getUniformLocation(shader, "atlas")!;

  const transform = mat4.create();
  const model = mat4.create();
  const projection = mat4.perspective(
    mat4.create(),
    Math.PI / 3,
    display.width / display.height,
    0.01,
    100
  );

  const ORIGIN = [0, 0, 0] as const;
  const UP = [0, 1, 0] as const;

  let distance = 3;

  let ry = 0;
  let rx = 0;

  const position = [0, 0, distance];
  const view = mat4.lookAt(mat4.create(), position, ORIGIN, UP);

  display.onclick = (e) => {
    e.preventDefault();
    display.requestPointerLock();
  };

  const ROTATION_LIMIT = Math.PI - 0.001;

  let movement = 0;
  display.onmousemove = (e) => {
    if (document.pointerLockElement === display) {
      ry += e.movementX / 100;
      rx -= e.movementY / 100;
      rx = clamp(rx, -ROTATION_LIMIT, ROTATION_LIMIT);
      position[0] = position[1] = 0;
      position[2] = distance;
      vec3.rotateX(position, position, ORIGIN, rx);
      vec3.rotateY(position, position, ORIGIN, ry);
      mat4.lookAt(view, position, ORIGIN, UP);
      movement = 60;
    }
  };

  const atlas = createTex2D(gl);
  const atlasIndex = 0;

  const ATLAS_SIZE = 128;

  const canvas = createDebugAtlas(ATLAS_SIZE, ATLAS_SIZE);
  const ctx = canvas.getContext("2d", {
      desynchronized: true,
      alpha: true
  })!;

  let atlasOffsetX = 0;
  let atlasStartY = 0;
  let atlasEndY = 0;

  const textures: Record<string, readonly [number, number, number, number]> = Object.create(null);

  await Promise.all([
      loadTexture("top", "./assets/textures/blocks/crafting_table_top.png"),
      loadTexture("side", "./assets/textures/blocks/crafting_table_side.png"),
      loadTexture("front", "./assets/textures/blocks/crafting_table_front.png"),
      loadTexture("bottom", "./assets/textures/blocks/oak_planks.png"),
  ]);

  const mesh: MeshData = {
    vertices: [],
    elements: [],
  };

  console.log(textures.top);

  combineMesh(mesh, cube.south, ORIGIN, textures.front);
  combineMesh(mesh, cube.top, ORIGIN, textures.top);
  combineMesh(mesh, cube.east, ORIGIN, textures.side);
  combineMesh(mesh, cube.bottom, ORIGIN, textures.bottom);
  combineMesh(mesh, cube.north, ORIGIN, textures.front);
  combineMesh(mesh, cube.west, ORIGIN, textures.side);

  const vao = createMeshVAO(gl);
  uplaodMeshToVAO(gl, vao, mesh);

  gl.uniform1i(uAtlas, atlasIndex);

  (function frame() {
    if (movement <= 0) {
      mat4.rotateX(model, model, +0.02);
      mat4.rotateY(model, model, -0.03);
    } else {
      movement--;
    }
    mat4.mul(transform, projection, view);
    mat4.mul(transform, transform, model);

    gl.uniformMatrix4fv(uTransform, false, transform);

    drawMeshVAO(gl, vao, mesh.elements.length);

    requestAnimationFrame(frame);
  })();

  async function loadTexture(name: string, source: string) {
      textures[name] = await loadImage(source);
  }

  async function loadImage(source: string): Promise<readonly [number, number, number, number]> {
    const image = await fetchImageBitmap(source);
    const width = image.width, height = image.height;
    let x = atlasOffsetX, y = atlasStartY;
    if (atlasOffsetX + width >= ATLAS_SIZE) {
        y = atlasStartY = atlasEndY;
        atlasEndY += height;
        x = atlasOffsetX = 0;
    } else {
        atlasOffsetX += width;
        atlasEndY = Math.max(atlasEndY, y + height);
    }
    ctx.drawImage(image, x, y);
    uploadTexture(gl, atlas, canvas, atlasIndex);
    image.close();
    const w = width / ATLAS_SIZE;
    const h = height / ATLAS_SIZE;
    const s = x / ATLAS_SIZE;
    const t = y / ATLAS_SIZE;
    return [s, t, w, h];
  }

})();

import debugVert from "./debug.vert";
import debugFrag from "./debug.frag";
import uploadTexture from "./gl/uploadTexture";

function createOffscreenAtlas(width: number, height: number) {
    return new OffscreenCanvas(width, height);
}

function createDebugAtlas(width: number, height: number) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);
    canvas.style.position = "fixed";
    canvas.style.top = canvas.style.left = "0";
    canvas.style.pointerEvents = "none";
    return canvas as unknown as OffscreenCanvas;
}

async function fetchText(source: string) {
  return (await fetch(source)).text();
}

async function fetchImageBitmap(source: string) {
  return createImageBitmap(await (await fetch(source)).blob());
}
