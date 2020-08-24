import { createDebugCanvas } from "./utils";
import Rect from "./math/Rect";

export default class TextureAtlas {
  private _size: number;
  private _canvas: OffscreenCanvas;
  private _context: OffscreenCanvasRenderingContext2D;

  public constructor(size: number) {
    this._size = size;
    this._canvas = createDebugCanvas(size, size);
    this._context = this._canvas.getContext("2d", {
      desynchronized: false
    })!;
    this._insertImage = this._insertImage.bind(this);
    this._spaces = [Rect.pool.get(0, 0, size, size)];

    // const ctx = this._context;
    // const count = 8;
    // const length = size / count;
    // ctx.beginPath();
    // for (let i = 1; i < count; i++) {
    //   const offset = i * length;
    //   ctx.moveTo(offset, 0);
    //   ctx.lineTo(offset, size);
    //   ctx.moveTo(0, offset);
    //   ctx.lineTo(size, offset);
    // }
    // ctx.strokeStyle = "white";
    // ctx.stroke();
    // const area = count * count;
    // ctx.fillStyle = "lime";
    // for (let i = 0; i < area; i++) {
    //   const x = i % count;
    //   const y = (i / count) | 0;
    //   ctx.fillText(String(i), x * length, (y + 1) * length);
    // }
  }

  private _spaces: Rect[];

  private _addSpace(x: number, y: number, width: number, height: number) {
    this._spaces.push(Rect.pool.get(x, y, width, height));
  }

  private _insertImage(image: CanvasImageSource) {
    const spaces = this._spaces;
    const context = this._context;
    const iw = Number(image.width);
    const ih = Number(image.height);
    const size = this._size;
    for (let i = spaces.length - 1; i >= 0; i--) {
      const rect = spaces[i];
      if (rect.width < iw || rect.height < ih) continue;
      const { x, y, width, height } = spaces.splice(i, 1)[0];
      Rect.pool.release(rect);
      context.drawImage(image, x, y);
      if (iw !== width || ih !== height) {
        if (ih === height) {
          this._addSpace(x + iw, y, width - iw, ih);
        } else if (iw === width) {
          this._addSpace(x, y + ih, width, height - ih);
        } else {
          this._addSpace(x, y + ih, width, height - ih);
          this._addSpace(x + iw, y, width - iw, ih);
        }
      }
      return Rect.pool.get(x / size, y / size, iw / size, ih / size);
    }
    throw "Failed to place image in atlas.";
  }

  public add(images: CanvasImageSource[]) {
    return images.map(this._insertImage);
  }

  public get source(): TexImageSource {
    return this._canvas;
  }

  public dispose() {
    for (const rect of this._spaces) rect.dispose();
  }
}
