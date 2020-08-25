import Camera from "./Camera";

export default class OrbitController {
  private _onMouseDown!: (e: PointerEvent) => void;
  private _onMouseUp!: (e: PointerEvent) => void;

  public readonly element: HTMLElement;
  public readonly camera: Camera;
  public readonly mode: "capture" | "lock";

  public constructor({
    element,
    camera,
    mode = "capture"
  }: {
    element: HTMLElement;
    camera: Camera;
    mode?: "capture" | "lock";
  }) {
    this.element = element;
    this.camera = camera;
    this.mode = mode;
    this._attachEventHandlers();
  }

  // TODO: finish the mouse movement and add mouse wheel events, then replace the current hacky implementation

  private _onMouseMove(e: PointerEvent) {
    e.preventDefault();

    const camera = this.camera;
  }

  private _attachEventHandlers() {
    const element = this.element;
    const mode = this.mode;

    element.addEventListener(
      "pointerdown",
      (this._onMouseDown = e => {
        e.preventDefault();
        if (mode === "capture") {
          element.setPointerCapture(e.pointerId);
        } else {
          element.requestPointerLock();
        }
      })
    );

    element.addEventListener(
      "pointermove",
      (this._onMouseMove = this._onMouseMove.bind(this))
    );

    element.addEventListener(
      "pointerup",
      (this._onMouseUp = e => {
        e.preventDefault();
        if (mode === "capture") {
          element.releasePointerCapture(e.pointerId);
        }
      })
    );
  }

  private _detachEventHandlers() {
    const element = this.element;
    element.removeEventListener("pointerdown", this._onMouseDown);
    element.removeEventListener("pointerup", this._onMouseUp);
    element.removeEventListener("pointermove", this._onMouseMove);
  }

  dispose() {
    this._detachEventHandlers();
  }
}
