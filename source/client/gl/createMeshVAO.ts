import bindVAO from "./bindVAO";

const enum VAO {
  float = 4,
  POSITION = float * 3,
  NORMAL = float * 3,
  UV = float * 2,
  STRIDE = POSITION + NORMAL + UV,
  POSITION_OFFSET = 0,
  UV_OFFSET = POSITION_OFFSET + POSITION,
  NORMAL_OFFSET = UV_OFFSET + NORMAL,
}

export const buffers = new WeakMap<
  WebGLVertexArrayObject,
  {
    vbo: WebGLBuffer;
    ebo: WebGLBuffer;
  }
>();

export default function createMeshVAO(gl: WebGL2RenderingContext) {
  const vao = gl.createVertexArray()!;
  const cache = {} as any;
  buffers.set(vao, cache);
  gl.bindVertexArray(vao);
  {
    {
      const ebo = (cache.ebo = gl.createBuffer());
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
    }
    {
      const vbo = (cache.vbo = gl.createBuffer());
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.enableVertexAttribArray(0);
      gl.enableVertexAttribArray(1);
      gl.enableVertexAttribArray(2);
      gl.vertexAttribPointer(
        0,
        3,
        gl.FLOAT,
        false,
        VAO.STRIDE,
        VAO.POSITION_OFFSET
      );
      gl.vertexAttribPointer(1, 2, gl.FLOAT, false, VAO.STRIDE, VAO.UV_OFFSET);
      gl.vertexAttribPointer(
        2,
        3,
        gl.FLOAT,
        false,
        VAO.STRIDE,
        VAO.NORMAL_OFFSET
      );
    }
  }
  bindVAO(gl);

  return vao;
}
