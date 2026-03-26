import * as THREE from "three";

import { InteractiveEntity } from "./interactive";
import { OverlayUI } from "../ui/overlay";

interface EmergencySource {
  label: string;
  title: string;
  value: string;
  action: "external" | "mailto";
  detail: string;
  icon: "mail" | "calendar";
}

class EmergencyScreenEntity implements InteractiveEntity {
  public readonly object3D: THREE.Object3D;
  public readonly label: string;

  private readonly mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private readonly material: THREE.MeshBasicMaterial;
  private readonly overlay: OverlayUI;
  private readonly source: EmergencySource;

  constructor(position: THREE.Vector3, source: EmergencySource, overlay: OverlayUI) {
    this.label = source.label;
    this.source = source;
    this.overlay = overlay;
    this.material = new THREE.MeshBasicMaterial({
      map: createEmergencyScreenTexture(source),
      color: "#ffffff",
      toneMapped: false,
      transparent: true,
    });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.28, 0.92), this.material);
    this.mesh.position.copy(position);
    this.object3D = this.mesh;
  }

  setHovered(hovered: boolean): void {
    this.material.color.set(hovered ? "#fff6f6" : "#ffffff");
    this.mesh.scale.setScalar(hovered ? 1.03 : 1);
  }

  interact(): void {
    if (this.source.action === "mailto") {
      window.location.href = this.source.value;
      this.overlay.setStatus(this.source.title, "Opening the email client.");
      return;
    }

    window.open(this.source.value, "_blank", "noopener,noreferrer");
    this.overlay.setStatus(this.source.title, "Opening source in a new tab.");
  }
}

function canvasTexture(width: number, height: number, draw: (context: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to create terminal texture");
  }
  draw(context);
  return new THREE.CanvasTexture(canvas);
}

function createSignTexture(): THREE.CanvasTexture {
  return canvasTexture(900, 220, (context) => {
    context.fillStyle = "rgba(252, 244, 244, 0.96)";
    context.fillRect(0, 0, 900, 220);
    context.strokeStyle = "rgba(176, 52, 52, 0.95)";
    context.lineWidth = 8;
    context.strokeRect(16, 16, 868, 188);
    context.fillStyle = "#962c2c";
    context.font = "700 56px IBM Plex Mono, monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("[ CONTACT ME - EMERGENCY ]", 450, 110);
  });
}

function createEmergencyScreenTexture(source: EmergencySource): THREE.CanvasTexture {
  return canvasTexture(900, 640, (context) => {
    const gradient = context.createLinearGradient(0, 0, 900, 640);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(1, "#eff4f7");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 900, 640);
    context.strokeStyle = "rgba(188, 78, 78, 0.8)";
    context.lineWidth = 8;
    context.strokeRect(14, 14, 872, 612);

    context.fillStyle = "#982f2f";
    context.font = "700 38px IBM Plex Mono, monospace";
    context.fillText(source.title.toUpperCase(), 34, 68);

    context.fillStyle = "rgba(36, 56, 68, 0.9)";
    context.font = "400 23px IBM Plex Mono, monospace";
    context.fillText(source.detail, 34, 122);

    context.strokeStyle = "rgba(162, 190, 204, 0.8)";
    context.strokeRect(34, 164, 832, 366);

    context.strokeStyle = "rgba(152, 47, 47, 0.76)";
    context.lineWidth = 12;

    if (source.icon === "mail") {
      context.strokeRect(130, 250, 300, 180);
      context.beginPath();
      context.moveTo(130, 250);
      context.lineTo(280, 360);
      context.lineTo(430, 250);
      context.stroke();
    } else {
      context.strokeRect(160, 232, 240, 210);
      context.beginPath();
      context.moveTo(160, 292);
      context.lineTo(400, 292);
      context.stroke();
      context.beginPath();
      context.moveTo(220, 210);
      context.lineTo(220, 262);
      context.moveTo(340, 210);
      context.lineTo(340, 262);
      context.stroke();
    }

    context.fillStyle = "rgba(44, 75, 90, 0.9)";
    context.font = "400 24px IBM Plex Mono, monospace";
    const lines = source.value.match(/.{1,30}/g) ?? [source.value];
    lines.forEach((line, index) => {
      context.fillText(line, 484, 278 + index * 34);
    });

    context.fillStyle = "rgba(152, 47, 47, 0.86)";
    context.font = "400 20px IBM Plex Mono, monospace";
    context.fillText(source.action === "mailto" ? "press E to open mail client" : "press E to open calendly", 54, 494);
  });
}

export class ComputerTerminal {
  public readonly group = new THREE.Group();
  public readonly interactives: InteractiveEntity[] = [];

  constructor(overlay: OverlayUI) {
    this.group.name = "contact-terminal";
    this.group.position.set(0, 0, 0.8);
    this.group.rotation.y = Math.PI;

    const totem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.48, 1.7, 24),
      new THREE.MeshStandardMaterial({
        color: "#d9e3e9",
        metalness: 0.12,
        roughness: 0.74,
      }),
    );
    totem.position.set(0, 1.0, 0);
    this.group.add(totem);

    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(2.1, 0.48),
      new THREE.MeshBasicMaterial({
        map: createSignTexture(),
        transparent: true,
        color: "#ffffff",
        toneMapped: false,
      }),
    );
    sign.position.set(0.12, 2.2, 0.68);
    sign.rotation.y = -0.1;
    this.group.add(sign);

    const sources: EmergencySource[] = [
      {
        label: "Calendly",
        title: "Calendly",
        value: "https://calendly.com/lucaseyer",
        action: "external",
        detail: "schedule a conversation",
        icon: "calendar",
      },
      {
        label: "Email",
        title: "Email",
        value: "mailto:lucaseyer@gmail.com",
        action: "mailto",
        detail: "direct contact channel",
        icon: "mail",
      },
    ];

    const positions = [
      new THREE.Vector3(-0.82, 0.86, 1.08),
      new THREE.Vector3(0.82, 0.86, 1.08),
    ];

    sources.forEach((source, index) => {
      const entity = new EmergencyScreenEntity(positions[index], source, overlay);
      this.interactives.push(entity);
      this.group.add(entity.object3D);
    });

    const frameBar = new THREE.Mesh(
      new THREE.BoxGeometry(2.15, 0.08, 0.06),
      new THREE.MeshStandardMaterial({
        color: "#dfe8ed",
        metalness: 0.08,
        roughness: 0.74,
      }),
    );
    frameBar.position.set(0, 0.22, 1.14);
    this.group.add(frameBar);

    const lowerBar = new THREE.Mesh(
      new THREE.BoxGeometry(2.15, 0.08, 0.06),
      new THREE.MeshStandardMaterial({
        color: "#dfe8ed",
        metalness: 0.08,
        roughness: 0.74,
      }),
    );
    lowerBar.position.set(0, 1.5, 1.14);
    this.group.add(lowerBar);
  }
}
