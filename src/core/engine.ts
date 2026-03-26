import { Clock } from "three";

import { PortfolioCamera } from "./camera";
import { PortfolioRenderer } from "./renderer";
import { PortfolioScene } from "./scene";

export interface RuntimeSystem {
  update(deltaTime: number): void;
}

interface PortfolioEngineOptions {
  scene: PortfolioScene;
  camera: PortfolioCamera;
  renderer: PortfolioRenderer;
  systems: RuntimeSystem[];
  onResize: (aspect: number) => void;
}

export class PortfolioEngine {
  private readonly scene: PortfolioScene;
  private readonly camera: PortfolioCamera;
  private readonly renderer: PortfolioRenderer;
  private readonly systems: RuntimeSystem[];
  private readonly onResize: (aspect: number) => void;
  private readonly clock = new Clock();

  constructor(options: PortfolioEngineOptions) {
    this.scene = options.scene;
    this.camera = options.camera;
    this.renderer = options.renderer;
    this.systems = options.systems;
    this.onResize = options.onResize;
    window.addEventListener("resize", this.handleResize);
  }

  start(): void {
    this.clock.start();
    this.renderer.instance.setAnimationLoop(this.tick);
  }

  private tick = (): void => {
    const deltaTime = this.clock.getDelta();
    this.systems.forEach((system) => system.update(deltaTime));
    this.renderer.render(this.scene, this.camera);
  };

  private handleResize = (): void => {
    this.renderer.resize();
    this.onResize(this.renderer.aspect);
  };
}
