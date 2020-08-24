import ObjectPool from "../ObjectPool";

export default class Rect {
  public constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}

  public set(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    return this;
  }

  public static create(x: number, y: number, width: number, height: number) {
    return new Rect(x, y, width, height);
  }

  public dispose() {
    Rect.pool.release(this);
  }

  public static readonly pool = new ObjectPool(Rect);
}
