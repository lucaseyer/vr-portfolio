import * as THREE from "three";
import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer.js";

export class PortfolioRenderer {
  public readonly instance: THREE.WebGLRenderer;
  public readonly domElement: HTMLCanvasElement;
  public readonly cssRenderer: CSS3DRenderer;

  constructor(container: HTMLElement) {
    container.style.position = "relative";

    this.instance = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.instance.setSize(window.innerWidth, window.innerHeight);
    this.instance.outputColorSpace = THREE.SRGBColorSpace;
    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
    this.domElement = this.instance.domElement;
    this.domElement.classList.add("webgl-layer");
    container.appendChild(this.domElement);

    this.cssRenderer = new CSS3DRenderer();
    this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
    this.cssRenderer.domElement.className = "css3d-layer";
    container.appendChild(this.cssRenderer.domElement);
  }

  get aspect(): number {
    return window.innerWidth / window.innerHeight;
  }

  resize(): void {
    this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.instance.setSize(window.innerWidth, window.innerHeight);
    this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
  }

  render(scene: THREE.Scene, camera: THREE.Camera): void {
    this.instance.render(scene, camera);
    this.cssRenderer.render(scene, camera);
  }
}
