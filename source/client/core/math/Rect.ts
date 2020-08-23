import ObjectPool from "../ObjectPool";

export default class Rect {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}

  set(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    return this;
  }

  static create(x: number, y: number, width: number, height: number) {
    return new Rect(x, y, width, height);
  }

  static pool = new ObjectPool(Rect);
}
