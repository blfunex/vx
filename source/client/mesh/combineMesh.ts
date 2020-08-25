import MeshData from "./MeshData";
import Rect from "../core/math/Rect";

export default function combineMesh(
  destination: MeshData,
  source: MeshData,
  position?: readonly [number, number, number],
  texture?: Rect
): MeshData;
export default function combineMesh(
  destination: MeshData,
  source: MeshData,
  [x, y, z] = [0, 0, 0] as readonly [number, number, number],
  texture = Rect.pool.getTransient(0, 0, 1, 1)
) {
  const { elements, vertices } = destination;
  const start = (vertices.length / 8) | 0;
  elements.push.apply(
    elements,
    source.elements.map(element => element + start)
  );
  const data = source.vertices;
  const count = data.length;
  for (let i = 0; i < count; i += 8) {
    vertices.push(
      data[i] + x,
      data[i + 1] + y,
      data[i + 2] + z,
      data[i + 3] * texture.width + texture.x,
      data[i + 4] * texture.height + texture.y,
      data[i + 5],
      data[i + 6],
      data[i + 7]
    );
  }
  return destination;
}
