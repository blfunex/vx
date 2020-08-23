import MeshData from "./MeshData";

interface ObjectData extends MeshData {
  index: number;
  hash: Record<string, number>;
}

const ATTRIBUTE_SIZE = [
  3, // POSITION
  2, // UV
  3, // NORMAL
];

export default function parseOBJ(data: string): Record<string, MeshData> {
  const meshes: Record<string, ObjectData> = Object.create(null);

  const positions: number[] = [];
  const uvs: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  let current: ObjectData = (meshes["default"] = {
    vertices: [],
    elements: [],
    index: 0,
    hash: Object.create(null),
  });

  data.split("\n").forEach((line) => parse(line.trim()));

  function parse(line: string) {
    if (line.length === 0 || line.startsWith("#")) return;
    const [command, ...args] = line.split(/\s+/);
    switch (command) {
      case "v":
        positions.push(
          parseFloat(args[0]),
          parseFloat(args[1]),
          parseFloat(args[2])
        );
        return;
      case "vt":
        uvs.push(1 - parseFloat(args[0]), 1 - parseFloat(args[1]));
        return;
      case "vn":
        normals.push(
          parseFloat(args[0]),
          parseFloat(args[1]),
          parseFloat(args[2])
        );
        return;
      case "f":
        if (args.length !== 3)
          throw new Error(
            "Only triangles are supported for now, please triangulate when exporting."
          );
        for (const vertex of args) {
          const cache = current.hash[vertex];
          if (cache !== undefined) {
            current.elements.push(cache);
          } else {
            const elements = vertex.split("/");
            if (elements.length !== 3)
              throw new Error(
                "An element is missing make sure your model has normals and uv coordinates"
              );
            const [position, uv, normal] = elements.map(
              (x, index) => (parseInt(x, 10) - 1) * ATTRIBUTE_SIZE[index]
            );
            current.vertices.push(
              positions[position],
              positions[position + 1],
              positions[position + 2],
              uvs[uv],
              uvs[uv + 1],
              normals[normal],
              normals[normal + 1],
              normals[normal + 2]
            );
            current.elements.push((current.hash[vertex] = current.index++));
          }
        }
        return;
      case "o":
        current = meshes[args[0]] = meshes[args[0]] ?? {
          vertices: [],
          elements: [],
          index: 0,
          hash: Object.create(null),
        };
        return;
      default:
        throw new Error(`Unsupported OBJ command "${command}".`);
    }
  }

  function cleanup() {
    const initial = meshes["default"];
    if (initial.elements.length === 0) delete meshes["default"];
    positions.length = normals.length = uvs.length = indices.length = 0;
  }

  cleanup();

  return Object.keys(meshes).reduce((o, name) => {
    const mesh = meshes[name];
    o[name] = {
      vertices: mesh.vertices,
      elements: mesh.elements,
    };
    return o;
  }, Object.create(null) as Record<string, MeshData>);
}
