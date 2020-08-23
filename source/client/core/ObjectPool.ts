export interface PoolableObject<U extends any[]> {
  set(...args: U): this;
}

export type ObjectPoolClass<
  U extends any[],
  T extends PoolableObject<U>
> = {
  create(...args: U): T;
};

export default class ObjectPool<
  T extends PoolableObject<U>,
  U extends any[]
> {
  constructor(readonly type: ObjectPoolClass<U, T>) {}

  private _released: T[] = [];

  release(object: T) {
    this._released.push(object);
  }

  get(...args: U) {
    const released = this._released;
    if (released.length > 0) return released.pop()!.set(...args);
    else return this.type.create(...args);
  }
}
