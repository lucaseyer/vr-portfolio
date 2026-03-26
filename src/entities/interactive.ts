import * as THREE from "three";

export interface InteractiveEntity {
  readonly object3D: THREE.Object3D;
  readonly label: string;
  setHovered(hovered: boolean): void;
  interact(): void;
}
