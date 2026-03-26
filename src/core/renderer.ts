import * as THREE from "three";

export class PortfolioRenderer {
  public readonly instance: THREE.WebGLRenderer;
  public readonly domElement: HTMLCanvasElement;

  constructor(container: HTMLElement) {
    this.instance = new THREE.WebGLRenderer({ antialias: true });
    this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.instance.setSize(window.innerWidth, window.innerHeight);
    this.instance.outputColorSpace = THREE.SRGBColorSpace;
    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
    this.domElement = this.instance.domElement;
    container.appendChild(this.domElement);
  }

  get aspect(): number {
    return window.innerWidth / window.innerHeight;
  }

  resize(): void {
    this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.instance.setSize(window.innerWidth, window.innerHeight);
  }

  render(scene: THREE.Scene, camera: THREE.Camera): void {
    this.instance.render(scene, camera);
  }
}
