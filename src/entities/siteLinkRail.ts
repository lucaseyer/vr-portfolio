import * as THREE from "three";

import { InteractiveEntity } from "./interactive";
import { OverlayUI } from "../ui/overlay";

export interface ExperienceLinkItem {
  label: string;
  url: string;
  detail: string;
  fallback: string[];
}

class ExperienceLinkButton implements InteractiveEntity {
  public readonly object3D: THREE.Object3D;
  public readonly label: string;

  private readonly mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private readonly material: THREE.MeshBasicMaterial;
  private readonly item: ExperienceLinkItem;
  private readonly overlay: OverlayUI;
  private readonly onSelect: (item: ExperienceLinkItem) => void;

  constructor(position: THREE.Vector3, item: ExperienceLinkItem, overlay: OverlayUI, onSelect: (item: ExperienceLinkItem) => void) {
    this.label = item.label;
    this.item = item;
    this.overlay = overlay;
    this.onSelect = onSelect;
    this.material = new THREE.MeshBasicMaterial({
      map: createButtonTexture(item),
      color: "#ffffff",
      transparent: true,
      toneMapped: false,
    });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.48, 0.34), this.material);
    this.mesh.position.copy(position);
    this.object3D = this.mesh;
  }

  setHovered(hovered: boolean): void {
    this.material.color.set(hovered ? "#f1fbff" : "#ffffff");
    this.mesh.scale.setScalar(hovered ? 1.03 : 1);
  }

  interact(): void {
    this.onSelect(this.item);
    this.overlay.setStatus(this.label, "Projected into the in-world experience panel.");
  }
}

function createButtonTexture(item: ExperienceLinkItem): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 820;
  canvas.height = 200;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to create site link texture");
  }

  context.fillStyle = "rgba(248, 252, 254, 0.98)";
  context.fillRect(0, 0, 820, 200);
  context.strokeStyle = "rgba(96, 169, 196, 0.85)";
  context.lineWidth = 6;
  context.strokeRect(10, 10, 800, 180);

  context.fillStyle = "rgba(26, 68, 86, 0.98)";
  context.font = "700 32px IBM Plex Mono, monospace";
  context.fillText(item.label.toUpperCase(), 28, 70);

  context.fillStyle = "rgba(39, 95, 118, 0.92)";
  context.font = "400 18px IBM Plex Mono, monospace";
  context.fillText(item.detail, 28, 112);

  context.fillStyle = "rgba(65, 126, 149, 0.92)";
  context.font = "400 16px IBM Plex Mono, monospace";
  context.fillText(item.url.replace(/^https?:\/\//, ""), 28, 150);

  return new THREE.CanvasTexture(canvas);
}

export class SiteLinkRail {
  public readonly group = new THREE.Group();
  public readonly interactives: InteractiveEntity[] = [];

  constructor(overlay: OverlayUI, onSelect: (item: ExperienceLinkItem) => void) {
    const items: ExperienceLinkItem[] = [
      {
        label: "QA Specialist",
        url: "https://lucaseyer.dev/experience/work1",
        detail: "automation specialist // mobile and AI",
        fallback: [
          "Built automation for mobile and AI validation surfaces.",
          "Reduced regression noise with practical execution tooling.",
          "Worked across UI flows, API checks, and device-oriented validation.",
        ],
      },
      {
        label: "SDET",
        url: "https://lucaseyer.dev/experience/work2",
        detail: "reliability and tooling engineering",
        fallback: [
          "Focused on test reliability, tooling, and resilient execution layers.",
          "Improved confidence signals for broader engineering teams.",
          "Built systems that reduce flaky behavior and improve feedback quality.",
        ],
      },
      {
        label: "QA Manager",
        url: "https://lucaseyer.dev/experience/work3",
        detail: "quality strategy and delivery leadership",
        fallback: [
          "Led quality strategy with delivery focus and clear release signals.",
          "Coordinated process, coverage, and risk visibility across teams.",
          "Balanced execution speed with stronger validation discipline.",
        ],
      },
      {
        label: "DevOps/SRE",
        url: "https://lucaseyer.dev/experience/work4",
        detail: "platform operations and observability",
        fallback: [
          "Worked on infrastructure reliability, observability, and operations.",
          "Improved system feedback loops, automation, and release resilience.",
          "Connected quality concerns with runtime and platform health.",
        ],
      },
      {
        label: "QA Architect",
        url: "https://lucaseyer.dev/experience/work5",
        detail: "test architecture and systems design",
        fallback: [
          "Designed testing architecture around signal quality and maintainability.",
          "Built scalable validation layers across multiple product surfaces.",
          "Connected automation strategy with platform and product thinking.",
        ],
      },
    ];

    items.forEach((item, index) => {
      const button = new ExperienceLinkButton(new THREE.Vector3(2.16, 0.92 - index * 0.42, 0.11), item, overlay, onSelect);
      this.interactives.push(button);
      this.group.add(button.object3D);
    });
  }
}
