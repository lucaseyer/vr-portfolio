import * as THREE from "three";

import { InteractiveEntity } from "./interactive";
import { OverlayUI } from "../ui/overlay";

interface SiteLinkItem {
  label: string;
  url: string;
  detail: string;
}

class SiteLinkButton implements InteractiveEntity {
  public readonly object3D: THREE.Object3D;
  public readonly label: string;

  private readonly mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private readonly material: THREE.MeshBasicMaterial;
  private readonly url: string;
  private readonly overlay: OverlayUI;

  constructor(position: THREE.Vector3, item: SiteLinkItem, overlay: OverlayUI) {
    this.label = item.label;
    this.url = item.url;
    this.overlay = overlay;
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
    window.open(this.url, "_blank", "noopener,noreferrer");
    this.overlay.setStatus(this.label, "Opened experience page in a new tab.");
  }
}

function createButtonTexture(item: SiteLinkItem): THREE.CanvasTexture {
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

  constructor(overlay: OverlayUI) {
    const items: SiteLinkItem[] = [
      { label: "QA Specialist", url: "https://lucaseyer.dev/experience/work1", detail: "automation specialist // mobile and AI" },
      { label: "SDET", url: "https://lucaseyer.dev/experience/work2", detail: "reliability and tooling engineering" },
      { label: "QA Manager", url: "https://lucaseyer.dev/experience/work3", detail: "quality strategy and delivery leadership" },
      { label: "DevOps/SRE", url: "https://lucaseyer.dev/experience/work4", detail: "platform operations and observability" },
      { label: "QA Architect", url: "https://lucaseyer.dev/experience/work5", detail: "test architecture and systems design" },
    ];

    items.forEach((item, index) => {
      const button = new SiteLinkButton(new THREE.Vector3(2.16, 0.92 - index * 0.42, 0.11), item, overlay);
      this.interactives.push(button);
      this.group.add(button.object3D);
    });
  }
}
