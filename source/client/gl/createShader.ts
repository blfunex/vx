/// <reference path="./shaders.d.ts" />

export default function createShader(
  gl: WebGL2RenderingContext,
  v: string,
  f: string
) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, v);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, f);
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    console.error(gl.getProgramInfoLog(program));
  return program;
}

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    console.error(gl.getShaderInfoLog(shader));
  return shader;
}
