import * as THREE from "three";

export class PortfolioCamera extends THREE.PerspectiveCamera {
  public yaw = 0;
  public pitch = 0;

  constructor(aspect: number) {
    super(75, aspect, 0.1, 100);
    this.position.set(0, 1.7, 6);
  }

  resize(aspect: number): void {
    this.aspect = aspect;
    this.updateProjectionMatrix();
  }

  applyLook(deltaX: number, deltaY: number): void {
    const sensitivity = 0.0023;
    this.yaw -= deltaX * sensitivity;
    this.pitch -= deltaY * sensitivity;
    this.pitch = THREE.MathUtils.clamp(this.pitch, -Math.PI / 2 + 0.05, Math.PI / 2 - 0.05);
    this.rotation.set(this.pitch, this.yaw, 0, "YXZ");
  }

  getForwardVector(): THREE.Vector3 {
    return new THREE.Vector3(0, 0, -1).applyEuler(this.rotation).setY(0).normalize();
  }

  getRightVector(): THREE.Vector3 {
    return new THREE.Vector3(1, 0, 0).applyEuler(this.rotation).setY(0).normalize();
  }

  applyZoom(delta: number): void {
    this.fov = THREE.MathUtils.clamp(this.fov + delta * 0.015, 24, 75);
    this.updateProjectionMatrix();
  }
}
