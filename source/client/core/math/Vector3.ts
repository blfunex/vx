import ObjectPool from "../ObjectPool";

export default class Vector3 {
  constructor(public x: number, public y: number, public z: number) {}

  public set(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  public assign(vector: Vector3) {
    return this.set(vector.x, vector.y, vector.z);
  }

  public clone() {
    return Vector3.pool.get(this.x, this.y, this.z);
  }

  public static create(x: number, y: number, z: number) {
    return new Vector3(x, y, z);
  }

  public dispose() {
    Vector3.pool.release(this);
  }

  public static readonly pool = new ObjectPool(Vector3);
}
