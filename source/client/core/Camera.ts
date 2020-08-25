import Vector3 from "./math/Vector3";
import Euler from "./math/Euler";
import { noop } from "./utils";

export default class Camera {
  private _position: Vector3;
  private _rotation: Euler;

  private _left = Vector3.pool.get(1, 0, 0);
  private _up = Vector3.pool.get(0, 1, 0);
  private _forward = Vector3.pool.get(0, 0, 1);

  public get forward() {
    return this._forward;
  }

  public get up() {
    return this._up;
  }

  public get left() {
    return this._left;
  }

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
    (this._rotation.update = this._updateAxis.bind(this))();
  }

  private _updateAxis() {
    this._calculateForward();
    this._calculateRight();
    this._calculateUp();
  }

  private _calculateUp() {
    this._up.isCross(this._forward, this._left);
  }

  private _calculateRight() {
    this._left.isCross(this._forward, Vector3.UP);
  }

  private _calculateForward() {
    this._rotation.calculateForward(this._forward);
  }

  public dispose() {
    this._rotation.update = noop;
    this._position.dispose();
    this._rotation.dispose();
    this._forward.dispose();
    this._left.dispose();
    this._up.dispose();
  }
}
