export interface ObjectPoolObject<U extends any[]> {
  set(...args: U): this;
}

export type ObjectPoolFactory<U extends any[], T extends ObjectPoolObject<U>> = {
  create(...args: U): T;
};

export default class ObjectPool<T extends ObjectPoolObject<U>, U extends any[]> {
  public constructor(readonly type: ObjectPoolFactory<U, T>) {}

  private _released: T[] = [];

  public get released() {
    return this._released.length;
  }

  public release(object: T) {
    this._released.push(object);
  }

  /**
   * Do **not** borrow if you are calling a depandancy, or futher code in your stack level that will use the same object pool.
   */
  public borrow(...args: U): T;
  public borrow() {
    const rect = this.get.apply(this, (arguments as unknown) as U);
    this.release(rect);
    return rect;
  }

  public get(...args: U) {
    const released = this._released;
    if (released.length > 0) return released.pop()!.set(...args);
    else return this.type.create(...args);
  }

  public clear() {
    this._released.length = 0;
  }
}
