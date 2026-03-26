type KeyMap = Record<string, boolean>;

export class InputController {
  private readonly keys: KeyMap = {};
  private pointerLocked = false;
  private lookDeltaX = 0;
  private lookDeltaY = 0;
  private zoomDelta = 0;
  private interactQueued = false;
  private clickQueued = false;
  private readonly lockTarget: HTMLElement;

  constructor(lockTarget: HTMLElement) {
    this.lockTarget = lockTarget;
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("wheel", this.onWheel, { passive: true });
    document.addEventListener("pointerlockchange", this.onPointerLockChange);
    this.lockTarget.addEventListener("click", this.requestPointerLock);
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    this.keys[event.code] = true;

    if (event.code === "KeyE") {
      this.interactQueued = true;
    }
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    this.keys[event.code] = false;
  };

  private onMouseMove = (event: MouseEvent): void => {
    if (!this.pointerLocked) {
      return;
    }

    this.lookDeltaX += event.movementX;
    this.lookDeltaY += event.movementY;
  };

  private onMouseDown = (event: MouseEvent): void => {
    if (!this.pointerLocked || event.target !== this.lockTarget) {
      return;
    }

    this.clickQueued = true;
  };

  private onPointerLockChange = (): void => {
    this.pointerLocked = document.pointerLockElement === this.lockTarget;
  };

  private onWheel = (event: WheelEvent): void => {
    this.zoomDelta += event.deltaY;
  };

  private requestPointerLock = (): void => {
    this.capturePointerLock();
  };

  isPressed(code: string): boolean {
    return Boolean(this.keys[code]);
  }

  consumeLookDelta(): { x: number; y: number } {
    const delta = { x: this.lookDeltaX, y: this.lookDeltaY };
    this.lookDeltaX = 0;
    this.lookDeltaY = 0;
    return delta;
  }

  consumeInteract(): boolean {
    const queued = this.interactQueued;
    this.interactQueued = false;
    return queued;
  }

  consumeClick(): boolean {
    const queued = this.clickQueued;
    this.clickQueued = false;
    return queued;
  }

  consumeZoomDelta(): number {
    const delta = this.zoomDelta;
    this.zoomDelta = 0;
    return delta;
  }

  clearTransientInputs(): void {
    this.interactQueued = false;
    this.clickQueued = false;
    this.lookDeltaX = 0;
    this.lookDeltaY = 0;
    this.zoomDelta = 0;
  }

  isPointerLocked(): boolean {
    return this.pointerLocked;
  }

  capturePointerLock(): void {
    if (!this.pointerLocked) {
      this.lockTarget.requestPointerLock();
    }
  }

  releasePointerLock(): void {
    if (this.pointerLocked) {
      document.exitPointerLock();
    }
  }
}
