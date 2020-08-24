import ObjectPool from "../ObjectPool";

export const enum EulerOrder {}

export default class Euler {
  public constructor(
    public pitch: number,
    public yaw: number,
    public roll: number
  ) {}

  public set(pitch: number, yaw: number, roll: number) {
    this.pitch = pitch;
    this.yaw = yaw;
    this.roll = roll;
    return this;
  }

  public assign(euler: Euler) {
    return this.set(euler.pitch, euler.yaw, euler.roll);
  }

  public clone() {
    return Euler.pool.get(this.pitch, this.yaw, this.roll);
  }

  public static create(pitch: number, yaw: number, roll: number) {
    return new Euler(pitch, yaw, roll);
  }

  public dispose() {
    Euler.pool.release(this);
  }

  public static readonly pool = new ObjectPool(Euler);
}
