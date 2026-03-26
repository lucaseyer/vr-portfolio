import * as THREE from "three";

export class PortfolioScene extends THREE.Scene {
  constructor() {
    super();
    this.background = new THREE.Color("#eef5f8");
    this.fog = new THREE.Fog("#eef5f8", 18, 34);
  }
}
