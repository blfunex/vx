import parseOBJ from "./mesh/parseOBJ";
import MeshData from "./mesh/MeshData";
import combineMesh from "./mesh/combineMesh";
import createMeshVAO from "./gl/createMeshVAO";
import createShader from "./gl/createShader";
import drawMeshVAO from "./gl/drawMeshVAO";
import uplaodMeshToVAO from "./gl/uploadMeshToVAO";

// @ts-ignore
import { mat4, vec3 } from "https://unpkg.com/gl-matrix@3.3.0/esm/index.js";

function clamp(x: number, min: number, max: number) {
  return Math.max(min, Math.min(max, x));
}

(async () => {
  const data = await fetchText("./assets/model/cube.obj");
  const cube = parseOBJ(data);

  const mesh: MeshData = {
    vertices: [],
    elements: [],
  };

  combineMesh(mesh, cube.south);
  combineMesh(mesh, cube.top);
  combineMesh(mesh, cube.east);
  combineMesh(mesh, cube.bottom);
  combineMesh(mesh, cube.north);
  combineMesh(mesh, cube.west);

  const canvas = document.querySelector("canvas")!;

  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: true,
    desynchronized: true,
  })!;

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  const shader = createShader(gl, debugVert, debugFrag);

  const model = mat4.create();
  const projection = mat4.perspective(
    mat4.create(),
    Math.PI / 3,
    canvas.width / canvas.height,
    0.01,
    100
  );

  const ORIGIN = [0, 0, 0];
  const UP = [0, 1, 0];

  let distance = 10;

  let ry = 0;
  let rx = 0;

  const position = [0, 0, distance];
  const view = mat4.lookAt(mat4.create(), position, ORIGIN, UP);

  canvas.onclick = (e) => {
    e.preventDefault();
    canvas.requestPointerLock();
  };

  const ROTATION_LIMIT = Math.PI - 0.001;

  let movement = 0;
  canvas.onmousemove = (e) => {
    if (document.pointerLockElement === canvas) {
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

  const transform = mat4.create();

  const uTransform = gl.getUniformLocation(shader, "transform")!;

  const vao = createMeshVAO(gl);
  uplaodMeshToVAO(gl, vao, mesh);

  gl.useProgram(shader);

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
})();

import debugVert from "./debug.vert";
import debugFrag from "./debug.frag";

async function fetchText(source: string) {
  return (await fetch(source)).text();
}
