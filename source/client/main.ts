import {
  mat4,
  vec3
  // @ts-ignore
} from "https://unpkg.com/gl-matrix@3.3.0/esm/index.js";

import uplaodMeshToVAO from "./gl/uploadMeshToVAO";
import createMeshVAO from "./gl/createMeshVAO";
import combineMesh from "./mesh/combineMesh";
import createShader from "./gl/createShader";
import drawMeshVAO from "./gl/drawMeshVAO";
import createTex2D from "./gl/createTex2D";
import parseOBJ from "./mesh/parseOBJ";
import MeshData from "./mesh/MeshData";

import debugVert from "./debug.vert";
import debugFrag from "./debug.frag";
import uploadTexture from "./gl/uploadTexture";

import { fetchText, fetchImageBitmap } from "./core/fetch";
import { clamp } from "./core/math/utils";
import { createDebugCanvas } from "./core/utils";

(async () => {
  console.clear();

  const data = await fetchText("./assets/meshes/cube.obj");
  const cube = parseOBJ(data);

  const display = document.querySelector("canvas")!;

  const gl = createWebGLContext(display, {
    // alpha: false,
    antialias: false,
    depth: true,
    desynchronized: true
  });

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  gl.clearColor(0, 0.5, 1, 1);

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

  display.onclick = e => {
    e.preventDefault();
    display.requestPointerLock();
  };

  const ROTATION_LIMIT = Math.PI / 2 - 0.001;

  let movement = 0;
  display.onmousemove = e => {
    if (document.pointerLockElement === display) {
      ry += e.movementX / 100;
      rx -= e.movementY / 100;
      rx = clamp(rx, -ROTATION_LIMIT, ROTATION_LIMIT);
      position[0] = position[1] = 0;
      position[2] = distance;
      vec3.rotateX(position, position, ORIGIN, rx);
      vec3.rotateY(position, position, ORIGIN, ry);
      mat4.lookAt(view, position, ORIGIN, UP);
      movement = 180;
    }
  };

  const atlas = createTex2D(gl);
  const atlasIndex = 0;

  const ATLAS_SIZE = 128;

  const canvas = createDebugCanvas(ATLAS_SIZE, ATLAS_SIZE);
  const ctx = canvas.getContext("2d", {
    desynchronized: true,
    alpha: true
  })!;

  let atlasOffsetX = 0;
  let atlasStartY = 0;
  let atlasEndY = 0;

  const textures: Record<
    string,
    readonly [number, number, number, number]
  > = Object.create(null);

  await Promise.all([
    loadTexture("top", "./assets/textures/blocks/crafting_table_top.png"),
    loadTexture("side", "./assets/textures/blocks/crafting_table_side.png"),
    loadTexture("front", "./assets/textures/blocks/crafting_table_front.png"),
    loadTexture("bottom", "./assets/textures/blocks/oak_planks.png")
  ]);

  const mesh: MeshData = {
    vertices: [],
    elements: []
  };

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
    let scale = 1;
    if (movement > 0) {
      movement--;
      if (movement < 60) {
        scale = (1 - movement / 60) ** 3;
      } else {
        scale = 0;
      }
    }
    mat4.rotateY(model, model, -0.05 * scale);
    mat4.mul(transform, projection, view);
    mat4.mul(transform, transform, model);

    gl.uniformMatrix4fv(uTransform, false, transform);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawMeshVAO(gl, vao, mesh.elements.length);

    requestAnimationFrame(frame);
  })();

  async function loadTexture(name: string, source: string) {
    textures[name] = await loadImage(source);
  }

  async function loadImage(
    source: string
  ): Promise<readonly [number, number, number, number]> {
    const image = await fetchImageBitmap(source);
    const width = image.width,
      height = image.height;
    let x = atlasOffsetX,
      y = atlasStartY;
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

function createWebGLContext(
  canvas: HTMLCanvasElement,
  attributes: WebGLContextAttributes
) {
  const gl = (canvas.getContext("webgl2", attributes) ||
    canvas.getContext("experimental-webgl2", attributes)) as WebGL2RenderingContext;
  if (gl === null) return patchLegacyWebGL(canvas, attributes);
  return gl;
}

function patchLegacyWebGL(
  canvas: HTMLCanvasElement,
  attributes: WebGLContextAttributes
) {
  const gl = (canvas.getContext("webgl", attributes) ||
    canvas.getContext("experimental-webgl", attributes)) as WebGL2RenderingContext;
  if (gl === null) throw new Error("Failed to create GL context");
  const patch = gl as WebGL2RenderingContext;

  const vao = gl.getExtension("OES_vertex_array_object");

  if (vao === null) throw "Failed to load extension OES_vertex_array_object";

  patch.createVertexArray = vao.createVertexArrayOES.bind(vao);
  patch.isVertexArray = vao.isVertexArrayOES.bind(vao);
  patch.bindVertexArray = vao.bindVertexArrayOES.bind(vao);
  patch.deleteVertexArray = vao.deleteVertexArrayOES.bind(vao);
  // @ts-ignore
  patch.VERTEX_ARRAY_BINDING = vao.VERTEX_ARRAY_BINDING_OES;

  const glCreateShader = gl.createShader.bind(gl);

  patch.createShader = type => {
    const shader = glCreateShader(type);
    if (shader === null) return null;
    (shader as PatchedWebGLShader).type = type;
    return shader;
  };

  patch.shaderSource = patchLegacyWebGLShaderSource(gl);

  return patch;

  type PatchedWebGLShader = { type: number };

  function patchLegacyWebGLShaderSource(gl: WebGLRenderingContext) {
    const glShaderSource = gl.shaderSource.bind(gl);

    const rxIOStatement = /^(?:layout\([^)]*location\s*=\s*(\d+)\))?[ \t\r]*(out|in)\s+(vec[234])\s+([a-zA-Z][_a-zA-Z0-9]+);/gm;
    const rxShaderPrecision = /precision\s+[a-z]+\s+[a-zA-Z][_a-zA-Z0-9]+;/;
    const rxUniformSampler = /^uniform sampler(2D|Array|Cube|3D) ([a-zA-Z][_a-zA-Z0-9]+);/gm;

    function findShaderIO(source: string, onMatch: (...args: string[]) => void) {
      return source.replace(rxIOStatement, (_, ...data) => {
        data.splice(-2);
        onMatch.apply(null, data);
        return "";
      });
    }

    function getIndex<T>(list: T[], hint?: string) {
      if (hint === undefined) {
        const count = list.length;
        let index = 0;
        while (index < count) {
          if (list[index] === undefined) break;
          else index += 1;
        }
        return index;
      }
      return parseInt(hint, 10);
    }

    type IOLists<T> = Record<string, T[]>;
    type IOTemplates<T> = Record<string, (type: string, name: string) => T>;
    type IOReducers<T> = Record<string, (list: T[]) => string>;

    function patchShader<T>(
      source: string,
      templates: IOTemplates<T>,
      reducers: IOReducers<T>
    ) {
      const lists: IOLists<T> = {
        in: [],
        out: []
      };
      source = findShaderIO(source, (hint, dir, type, name) => {
        const list = lists[dir];
        const index = getIndex(list, hint);
        list[index] = templates[dir](type, name);
      });
      return reducers.in(lists.in) + reducers.out(lists.out) + source;
    }

    const vertTemplates: IOTemplates<string> = {
      in(type, name) {
        return `attribute ${type} ${name};`;
      },
      out(type, name) {
        return `varying ${type} ${name};`;
      }
    };

    const vertReducers: IOReducers<string> = {
      in(list) {
        return list.join("");
      },
      out(list) {
        return list.join("");
      }
    };

    let gl_FragColor: RegExp | undefined;
    const gl_FragData: RegExp[] = [];

    const rxIDCache = Object.create(null);
    function createRxID(id: string) {
      return rxIDCache[id] || (rxIDCache[id] = new RegExp(`\\b${id}\\b`, "g"));
    }

    const rxTextureCache = Object.create(null);
    function createRxTexture(id: string) {
      return (
        rxIDCache[id] ||
        (rxIDCache[id] = new RegExp(`texture\\(\s*\\b${id}\\b`, "g"))
      );
    }

    const fragTemplates: IOTemplates<string> = {
      in(type, name) {
        return `varying ${type} ${name};` as string;
      },
      out(_, name) {
        return name;
      }
    };

    const fragReducers: IOReducers<string> = {
      in(list: string[]) {
        return list.join("");
      },
      out(list: string[]) {
        if (list.length === 1) {
          gl_FragColor = createRxID(list[0]);
        } else {
          gl_FragData.push.apply(gl_FragData, list.map(createRxID));
        }
        return "";
      }
    };

    function patchVert(source: string) {
      return patchShader(source, vertTemplates, vertReducers);
    }

    function patchFrag(source: string) {
      gl_FragColor = undefined;
      gl_FragData.length = 0;
      const precisions: string[] = [];
      source = source.replace(rxShaderPrecision, precision => {
        precisions.push(precision);
        return "";
      });
      const uniforms: Record<string, string> = {};
      source.replace(rxUniformSampler, (_, type, name): any => {
        uniforms[name] = type;
      });
      for (const sampler in uniforms) {
        source = source.replace(
          createRxTexture(sampler),
          `texture${uniforms[sampler]}(${sampler}`
        );
      }
      source = patchShader(source, fragTemplates, fragReducers);
      source = precisions.join("") + source;
      if (gl_FragColor !== undefined) {
        source = source.replace(gl_FragColor, "gl_FragColor");
      } else {
        gl_FragData.forEach((rx, index) => {
          source = source.replace(rx, `gl_FragData[${index}]`);
        });
      }
      return source;
    }

    // https://github.com/vwochnik/rollup-plugin-glsl/blob/master/index.js#L4
    function compressShader(source: string) {
      let needNewline = false;
      return source
        .replace(
          /\\(?:\r\n|\n\r|\n|\r)|\/\*.*?\*\/|\/\/(?:\\(?:\r\n|\n\r|\n|\r)|[^\n\r])*/g,
          ""
        )
        .split(/\n+/)
        .reduce((result, line) => {
          line = line.trim().replace(/\s{2,}|\t/, " ");
          if (line[0] === "#") {
            if (needNewline) {
              result.push("\n");
            }

            result.push(line, "\n");
            needNewline = false;
          } else {
            result.push(
              line.replace(
                /\s*({|}|=|\*|,|\+|\/|>|<|&|\||\[|\]|\(|\)|\-|!|;)\s*/g,
                "$1"
              )
            );
            needNewline = true;
          }
          return result;
        }, [] as string[])
        .join("")
        .replace(/\n+/g, "\n");
    }

    return (shader: PatchedWebGLShader, source: string) => {
      source = source.replace(/#version 300 es/, "");
      if (shader.type === gl.VERTEX_SHADER) {
        source = patchVert(source);
      } else {
        source = patchFrag(source);
      }
      source = compressShader(source);
      return glShaderSource(shader, source);
    };
  }
}
