export interface PoolableObject<U extends any[]> {
  set(...args: U): this;
}

export type ObjectPoolClass<U extends any[], T extends PoolableObject<U>> = {
  create(...args: U): T;
};

export default class ObjectPool<T extends PoolableObject<U>, U extends any[]> {
  constructor(readonly type: ObjectPoolClass<U, T>) {}

  private _released: T[] = [];

  get released() {
    return this._released.length;
  }

  release(object: T) {
    this._released.push(object);
  }

  borrow(...args: U): T;
  borrow() {
    const rect = this.get.apply(this, (arguments as unknown) as U);
    this.release(rect);
    return rect;
  }

  get(...args: U) {
    const released = this._released;
    if (released.length > 0) return released.pop()!.set(...args);
    else return this.type.create(...args);
  }
}
