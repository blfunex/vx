#version 300 es
precision mediump float;

in vec2 v_uv;

out vec4 out_fragColor;

void main() {
    out_fragColor = vec4(v_uv, 0, 1);
}
