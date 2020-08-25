import Vector3, { ReadonlyVector3 } from "./math/Vector3";
import Euler from "./math/Euler";
import { noop } from "./utils";
import { mat4 } from "./math/utils";

export default class Camera {
  public __update = noop;

  private _position: Vector3;
  private _rotation: Euler;

  readonly left: ReadonlyVector3 = Vector3.pool.get(1, 0, 0);
  readonly up: ReadonlyVector3 = Vector3.pool.get(0, 1, 0);
  readonly forward: ReadonlyVector3 = Vector3.pool.get(0, 0, 1);

  public get position() {
    return this._position;
  }

  public set position(value: Vector3) {
    this._position.is(value);
  }

  public get rotation() {
    return this._rotation;
  }

  public set rotation(value: Euler) {
    this._rotation.is(value);
  }

  public constructor({
    position = Vector3.pool.getTransient(0, 0, 0),
    rotation = Euler.pool.getTransient(0, 0, 0)
  }) {
    this._position = position.clone();
    this._rotation = rotation.clone();
    (this._rotation.__update = this._updateAxis.bind(this))();
  }

  private _updateAxis() {
    this._calculateForward();
    this._calculateRight();
    this._calculateUp();
  }

  private _calculateUp() {
    (this.up as Vector3).isCross(this.forward, this.left);
  }

  private _calculateRight() {
    (this.left as Vector3).isCross(this.forward, Vector3.UP);
  }

  private _calculateForward() {
    this._rotation.calculateForward(this.forward as Vector3);
  }

  public calculateMat4(matrix: mat4) {
    const P = this.position;
    const F = this.forward;
    const L = this.left;
    const U = this.up;

    const Lx = L.x,
      Ly = L.y,
      Lz = L.z;

    const Ux = U.x,
      Uy = U.y,
      Uz = U.z;

    const Fx = F.x,
      Fy = F.y,
      Fz = F.z;

    const Px = P.x,
      Py = P.y,
      Pz = P.z;

    matrix[0] = -Lx;
    matrix[1] = -Ly;
    matrix[2] = -Lz;
    matrix[3] = -Lx * Px - Ly * Py - Lz * Pz;

    matrix[0] = Ux;
    matrix[1] = Uy;
    matrix[2] = Uz;
    matrix[3] = Py * Uy + Pz * Uz + Px * Ux;

    matrix[0] = -Fx;
    matrix[1] = -Fy;
    matrix[2] = -Fz;
    matrix[3] = -Px * Fx - Fy * Py - Lz * Pz;

    matrix[12] = 0;
    matrix[13] = 0;
    matrix[14] = 0;
    matrix[15] = 1;

    return matrix;
  }

  public dispose() {
    this._rotation.__update = this.__update = noop;
    this._position.dispose();
    this._rotation.dispose();
    (this.forward as Vector3).dispose();
    (this.left as Vector3).dispose();
    (this.up as Vector3).dispose();
  }
}
