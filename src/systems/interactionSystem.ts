import * as THREE from "three";

import { PortfolioCamera } from "../core/camera";
import { InputController } from "../core/input";
import { RuntimeSystem } from "../core/engine";
import { InteractionContext } from "../types";
import { InteractiveEntity } from "../entities/interactive";
import { OverlayUI } from "../ui/overlay";

interface InteractionSystemOptions {
  onInspect: (entity: InteractiveEntity) => void;
  overlay: OverlayUI;
}

type InteractionSystemContext = InteractionContext & InteractionSystemOptions;

export class InteractionSystem implements RuntimeSystem {
  private readonly camera: PortfolioCamera;
  private readonly input: InputController;
  private readonly raycaster = new THREE.Raycaster();
  private readonly mouse = new THREE.Vector2(0, 0);
  private readonly entities: InteractiveEntity[] = [];
  private readonly options: InteractionSystemContext;
  private hoveredEntity: InteractiveEntity | null = null;

  constructor(
    camera: PortfolioCamera,
    _lockTarget: HTMLElement,
    input: InputController,
    interactionContext: InteractionSystemContext,
  ) {
    this.camera = camera;
    this.input = input;
    this.options = interactionContext;
  }

  register(entity: InteractiveEntity): void {
    if ("attachInteractionContext" in entity && typeof entity.attachInteractionContext === "function") {
      entity.attachInteractionContext(this.options);
    }
    this.entities.push(entity);
  }

  update(_deltaTime: number): void {
    // The interaction ray always projects from screen center to keep first-person inspection predictable.
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersections = this.raycaster.intersectObjects(this.entities.map((entity) => entity.object3D), false);

    const nextHoveredEntity =
      intersections.length > 0
        ? this.entities.find((entity) => entity.object3D === intersections[0].object) ?? null
        : null;

    if (this.hoveredEntity !== nextHoveredEntity) {
      this.hoveredEntity?.setHovered(false);
      nextHoveredEntity?.setHovered(true);
      this.hoveredEntity = nextHoveredEntity;
      this.options.overlay.setFocusTarget(nextHoveredEntity?.label ?? null);
    }

    if ((this.input.consumeInteract() || this.input.consumeClick()) && this.hoveredEntity) {
      this.options.onInspect(this.hoveredEntity);
    }
  }
}
