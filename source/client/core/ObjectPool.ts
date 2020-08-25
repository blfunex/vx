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
   * - **Best use case**: you need a single value from the pool, you don't plan on calling a further depandancy that will use the same pool, and you don't intend on returning the value.
   * - **Document** that the value is borrowed and might change if leaking down the call stack _(e.i. returning the value)_.
   * - **Use `get` instead** if the you plan on leaking the further up the call stack _(e.i. a depandancy that might use the same pool)_.
   */
  public getTransient(...args: U): T;
  public getTransient() {
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
