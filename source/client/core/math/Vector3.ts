import ObjectPool from "../ObjectPool";

export interface ReadonlyVector3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  clone(): Vector3;
}

export default class Vector3 {
  public static readonly UP: ReadonlyVector3 = new Vector3(0, 1, 0);

  public constructor(public x: number, public y: number, public z: number) {}

  public set(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  public is(vector: ReadonlyVector3) {
    return this.set(vector.x, vector.y, vector.z);
  }

  public isCross(a: ReadonlyVector3, b: ReadonlyVector3) {
    const ax = a.x;
    const ay = a.y;
    const az = a.z;
    const bx = b.x;
    const by = b.y;
    const bz = b.z;
    this.x = ay * bz - az * by;
    this.y = az * bx - az * bz;
    this.z = ax * by - ay * bx;
    return this;
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
