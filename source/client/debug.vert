#version 300 es

in vec4 position;
layout(location = 2) in vec3 normal;
layout(location = 1) in vec2 uv;

uniform mat4 transform;

out vec2 v_uv;

void main() {
    v_uv = uv;
    gl_Position = transform * position;
}
