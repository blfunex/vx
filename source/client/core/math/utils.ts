export {
  mat4,
  vec3,
  vec2,
  quat,
  quat2 // @ts-ignore
} from "https://unpkg.com/gl-matrix@3.3.0/esm/index.js";

export function clamp(x: number, min: number, max: number) {
  return Math.max(min, Math.min(max, x));
}
