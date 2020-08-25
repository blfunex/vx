import ObjectPool from "../ObjectPool";
import Vector3 from "./Vector3";

import { noop } from "../utils";

export default class Euler {
  public __update = noop;

  private _pitch: number;
  private _yaw: number;
  private _roll: number;

  public get pitch() {
    return this._pitch;
  }
  public set pitch(value) {
    this._pitch = value;
    this.__update();
  }

  public get yaw() {
    return this._yaw;
  }
  public set yaw(value) {
    this._yaw = value;
    this.__update();
  }

  public get roll() {
    return this._roll;
  }
  public set roll(value) {
    this._roll = value;
    this.__update();
  }

  public constructor(pitch: number, yaw: number, roll: number) {
    this._pitch = pitch;
    this._yaw = yaw;
    this._roll = roll;
  }

  public set(pitch: number, yaw: number, roll: number) {
    this._pitch = pitch;
    this._yaw = yaw;
    this._roll = roll;
    return this;
  }

  public is(euler: Euler) {
    return this.set(euler._pitch, euler._yaw, euler._roll);
  }

  public clone() {
    return Euler.pool.get(this._pitch, this._yaw, this._roll);
  }

  public calculateForward(out: Vector3) {
    out.x = Math.cos(this._yaw) * Math.cos(this._pitch);
    out.y = Math.sin(this._yaw) * Math.cos(this._pitch);
    out.z = Math.sin(this._pitch);
    return out;
  }

  public static create(pitch: number, yaw: number, roll: number) {
    return new Euler(pitch, yaw, roll);
  }

  public dispose() {
    Euler.pool.release(this);
  }

  public static readonly pool = new ObjectPool(Euler);
}
