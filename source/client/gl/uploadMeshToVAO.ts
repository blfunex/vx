import MeshData from "../mesh/MeshData";
import bindVAO from "./bindVAO";

export default function uplaodMeshToVAO(
  gl: WebGL2RenderingContext,
  vao: WebGLVertexArrayObject,
  mesh: MeshData,
  dynamic = false
) {
  const usage = dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;
  bindVAO(gl, vao);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.elements), usage);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertices), usage);
}
