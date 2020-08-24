import Vector3 from "./math/Vector3";

export default class Camera {
  private _position: Vector3;

  public get position() {
    return this._position;
  }

  public set position(value: Vector3) {
    this._position.assign(value);
  }

  public constructor({ position = Vector3.pool.borrow(0, 0, 0) }) {
    this._position = position.clone();
  }

  public dispose() {
    this._position.dispose();
  }
}
