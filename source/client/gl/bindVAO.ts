const bound = new WeakMap<WebGL2RenderingContext, WebGLVertexArrayObject>();
export default function bindVAO(
  gl: WebGL2RenderingContext,
  vao?: WebGLVertexArrayObject
) {
  if (vao === undefined) {
    if (bound.has(gl)) {
      gl.bindVertexArray(bound.get(gl)!);
    }
  } else if (!bound.has(gl) || bound.get(gl) !== vao) {
    gl.bindVertexArray(vao);
    bound.set(gl, vao);
  }
}
