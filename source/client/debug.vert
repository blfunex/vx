#version 300 es

layout(location = 0) in vec4 position;
layout(location = 1) in vec2 uv;
layout(location = 2) in vec3 normal;

uniform mat4 transform;

out vec2 v_uv;

void main() {
    v_uv = uv;
    gl_Position = transform * position;
}
