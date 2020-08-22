import bindVAO from "./bindVAO";

export default function drawMeshVAO(
  gl: WebGL2RenderingContext,
  vao: WebGLVertexArrayObject,
  count: number,
  offset = 0
) {
  bindVAO(gl, vao);
  gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
}
