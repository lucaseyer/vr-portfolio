import * as THREE from "three";

import { PanelEntity } from "../entities/panel";

export class PortfolioRoom {
  public readonly group = new THREE.Group();
  public readonly bounds = {
    minX: -8.5,
    maxX: 8.5,
    minZ: -8.5,
    maxZ: 8.5,
  };

  private readonly panelAnchor = new THREE.Group();

  constructor() {
    this.group.name = "portfolio-room";
    this.buildShell();
    this.group.add(this.panelAnchor);
  }

  mountPanel(panel: PanelEntity): void {
    this.panelAnchor.add(panel.group);
  }

  private buildShell(): void {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({
        color: "#edf4f8",
        metalness: 0.12,
        roughness: 0.84,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.group.add(floor);

    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({
        color: "#f8fbfd",
        metalness: 0.05,
        roughness: 0.92,
        side: THREE.BackSide,
      }),
    );
    ceiling.position.y = 5;
    ceiling.rotation.x = Math.PI / 2;
    this.group.add(ceiling);

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: "#f6fafc",
      metalness: 0.06,
      roughness: 0.88,
      side: THREE.DoubleSide,
    });

    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 5), wallMaterial);
    backWall.position.set(0, 2.5, -10);
    this.group.add(backWall);

    const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 5), wallMaterial);
    frontWall.position.set(0, 2.5, 10);
    frontWall.rotation.y = Math.PI;
    this.group.add(frontWall);

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 5), wallMaterial);
    leftWall.position.set(-10, 2.5, 0);
    leftWall.rotation.y = Math.PI / 2;
    this.group.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 5), wallMaterial);
    rightWall.position.set(10, 2.5, 0);
    rightWall.rotation.y = -Math.PI / 2;
    this.group.add(rightWall);

    const lightStrips = [
      new THREE.Vector3(0, 4.95, -8),
      new THREE.Vector3(0, 4.95, 8),
      new THREE.Vector3(-8, 4.95, 0),
      new THREE.Vector3(8, 4.95, 0),
    ];

    lightStrips.forEach((position, index) => {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(index < 2 ? 8 : 0.12, 0.06, index < 2 ? 0.12 : 8),
        new THREE.MeshStandardMaterial({
          color: "#bfeeff",
          emissive: "#8ddcff",
          emissiveIntensity: 0.9,
        }),
      );
      strip.position.copy(position);
      this.group.add(strip);
    });

    const centerPlatform = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 2.2, 0.25, 32),
      new THREE.MeshStandardMaterial({
        color: "#ddeaf1",
        emissive: "#cbefff",
        emissiveIntensity: 0.08,
        metalness: 0.14,
        roughness: 0.82,
      }),
    );
    centerPlatform.position.set(0, 0.125, 0);
    centerPlatform.receiveShadow = true;
    this.group.add(centerPlatform);
  }
}

export function createRoom(): PortfolioRoom {
  return new PortfolioRoom();
}
