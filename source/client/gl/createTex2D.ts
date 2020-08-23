export default function createTex2D(gl: WebGL2RenderingContext, options?: {
    filter?: "linear" | "point",
    wrap?: "repeat" | "clamp",
}): WebGLTexture;
export default function createTex2D(gl: WebGL2RenderingContext, {
    filter = "point",
    wrap = "repeat",
}: {
    filter?: "linear" | "point",
    wrap?: "repeat" | "clamp",
} = {}) {
    const texture = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter === "linear" ? gl.LINEAR : gl.NEAREST);
    const wrapping = wrap === "repeat" ? gl.REPEAT : gl.CLAMP_TO_EDGE;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapping);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapping);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}