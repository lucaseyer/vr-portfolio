import * as THREE from "three";

import { PortfolioCamera } from "../core/camera";
import { InputController } from "../core/input";
import { RuntimeSystem } from "../core/engine";
import { PortfolioRoom } from "../world/room";

export class NavigationSystem implements RuntimeSystem {
  private readonly camera: PortfolioCamera;
  private readonly input: InputController;
  private readonly room: PortfolioRoom;
  private readonly velocity = new THREE.Vector3();
  private readonly damping = 10;
  private readonly maxSpeed = 4.8;

  constructor(camera: PortfolioCamera, input: InputController, room: PortfolioRoom) {
    this.camera = camera;
    this.input = input;
    this.room = room;
  }

  update(deltaTime: number): void {
    const look = this.input.consumeLookDelta();
    this.camera.applyLook(look.x, look.y);
    this.camera.applyZoom(this.input.consumeZoomDelta());

    const direction = new THREE.Vector3();
    if (this.input.isPressed("KeyW")) direction.add(this.camera.getForwardVector());
    if (this.input.isPressed("KeyS")) direction.sub(this.camera.getForwardVector());
    if (this.input.isPressed("KeyA")) direction.sub(this.camera.getRightVector());
    if (this.input.isPressed("KeyD")) direction.add(this.camera.getRightVector());

    if (direction.lengthSq() > 0) {
      direction.normalize().multiplyScalar(this.maxSpeed);
    }

    this.velocity.lerp(direction, 1 - Math.exp(-this.damping * deltaTime));
    this.camera.position.addScaledVector(this.velocity, deltaTime);

    this.camera.position.x = THREE.MathUtils.clamp(
      this.camera.position.x,
      this.room.bounds.minX,
      this.room.bounds.maxX,
    );
    this.camera.position.z = THREE.MathUtils.clamp(
      this.camera.position.z,
      this.room.bounds.minZ,
      this.room.bounds.maxZ,
    );
    this.camera.position.y = 1.7;
  }
}
