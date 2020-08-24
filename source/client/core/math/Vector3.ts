import ObjectPool from "../ObjectPool";

export default class Vector3 {
  constructor(public x: number, public y: number, public z: number) {}

  public set(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  public static create(x: number, y: number, z: number) {
    return new Vector3(x, y, z);
  }

  public static readonly pool = new ObjectPool(Vector3);
}
