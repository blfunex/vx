import MeshData from "./MeshData";

export default function combineMesh(
  destination: MeshData,
  source: MeshData,
  position?: [number, number, number],
  texture?: [number, number, number, number]
): MeshData;
export default function combineMesh(
  destination: MeshData,
  source: MeshData,
  [x, y, z] = [0, 0, 0],
  [tx, ty, tw, th] = [0, 0, 1, 1]
) {
  const { elements, vertices } = destination;
  const start = (vertices.length / 8) | 0;
  elements.push.apply(
    elements,
    source.elements.map((element) => element + start)
  );
  const data = source.vertices;
  const count = data.length;
  for (let i = 0; i < count; i += 8) {
    vertices.push(
      data[i] + x,
      data[i + 1] + y,
      data[i + 2] + z,
      data[i + 3] * tw + tx,
      data[i + 4] * th + ty,
      data[i + 5],
      data[i + 6],
      data[i + 7]
    );
  }
  return destination;
}
