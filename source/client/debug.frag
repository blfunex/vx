#version 300 es
precision mediump float;

in vec2 v_uv;

uniform sampler2D atlas;

out vec4 out_fragColor;

void main() {
    vec4 color = texture(atlas, v_uv);
    // if (color.a < 1) discard;
    out_fragColor = vec4(color.rgb, 1.0);
}
