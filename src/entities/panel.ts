import * as THREE from "three";

import { InteractiveEntity } from "./interactive";
import { DashboardMetric, InteractionContext, LinkItem, PanelConfig } from "../types";

interface LinkBadge {
  rect: { x: number; y: number; width: number; height: number };
  link: LinkItem;
}

function createCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to create panel canvas");
  }

  return [canvas, context];
}

function drawFrame(context: CanvasRenderingContext2D, width: number, height: number, color: string): void {
  context.clearRect(0, 0, width, height);
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(1, "#eef7fb");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  const glow = context.createRadialGradient(width * 0.12, height * 0.08, 10, width * 0.12, height * 0.08, width * 0.8);
  glow.addColorStop(0, "rgba(104, 191, 224, 0.18)");
  glow.addColorStop(1, "rgba(104, 191, 224, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = color;
  context.lineWidth = 8;
  context.strokeRect(20, 20, width - 40, height - 40);
}

function drawContainedImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const imageRatio = image.width / image.height;
  const frameRatio = width / height;

  let drawWidth = width;
  let drawHeight = height;

  if (imageRatio > frameRatio) {
    drawHeight = width / imageRatio;
  } else {
    drawWidth = height * imageRatio;
  }

  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 5,
): number {
  const words = text.split(" ");
  let line = "";
  let offsetY = y;
  let lines = 0;

  for (const word of words) {
    const testLine = `${line}${word} `;
    if (context.measureText(testLine).width > maxWidth && line.length > 0) {
      context.fillText(line.trim(), x, offsetY);
      line = `${word} `;
      offsetY += lineHeight;
      lines += 1;
      if (lines >= maxLines) {
        return offsetY;
      }
    } else {
      line = testLine;
    }
  }

  if (line && lines < maxLines) {
    context.fillText(line.trim(), x, offsetY);
    offsetY += lineHeight;
  }

  return offsetY;
}

function drawLinks(context: CanvasRenderingContext2D, links: LinkItem[], startY: number): LinkBadge[] {
  const badges = links.slice(0, 2).map((link) => {
    const short = link.label === "LinkedIn" ? "in" : link.label === "Resume PDF" ? "PDF" : "GH";
    return {
      label: short,
      text: link.label,
      url: link.url.replace(/^https?:\/\//, ""),
      link,
    };
  });

  return badges.map((badge, index) => {
    const x = 48 + index * 228;
    context.fillStyle = "#dceef5";
    context.fillRect(x, startY, 206, 58);
    context.strokeStyle = "rgba(86, 154, 180, 0.8)";
    context.strokeRect(x, startY, 206, 58);
    context.fillStyle = "#1b4658";
    context.font = "700 26px IBM Plex Mono, monospace";
    context.fillText(badge.label, x + 16, startY + 36);
    context.font = "700 15px IBM Plex Mono, monospace";
    context.fillText(badge.text, x + 58, startY + 23);
    context.font = "400 14px IBM Plex Mono, monospace";
    context.fillText(badge.url, x + 58, startY + 42);
    return {
      rect: { x, y: startY, width: 206, height: 58 },
      link: badge.link,
    };
  });
}

class PanelLinkEntity implements InteractiveEntity {
  public readonly object3D: THREE.Object3D;
  public readonly label: string;

  private readonly mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private readonly material: THREE.MeshBasicMaterial;
  private readonly url: string;
  private readonly isEnabled: () => boolean;

  constructor(
    label: string,
    url: string,
    rect: { x: number; y: number; width: number; height: number },
    screenSize: { width: number; height: number },
    canvasSize: { width: number; height: number },
    isEnabled: () => boolean,
  ) {
    this.label = label;
    this.url = url;
    this.isEnabled = isEnabled;

    const meshWidth = (rect.width / canvasSize.width) * screenSize.width;
    const meshHeight = (rect.height / canvasSize.height) * screenSize.height;
    const centerX = ((rect.x + rect.width / 2) / canvasSize.width - 0.5) * screenSize.width;
    const centerY = (0.5 - (rect.y + rect.height / 2) / canvasSize.height) * screenSize.height;

    this.material = new THREE.MeshBasicMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0.001,
      toneMapped: false,
    });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(meshWidth, meshHeight), this.material);
    this.mesh.position.set(centerX, centerY, 0.092);
    this.object3D = this.mesh;
  }

  setHovered(hovered: boolean): void {
    this.material.opacity = hovered && this.isEnabled() ? 0.12 : 0.001;
    this.material.color.set(hovered ? "#ffdddd" : "#ffffff");
  }

  interact(): void {
    if (!this.isEnabled()) {
      return;
    }
    window.open(this.url, "_blank", "noopener,noreferrer");
  }
}

export class PanelEntity implements InteractiveEntity {
  public readonly group = new THREE.Group();
  public readonly frame: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
  public readonly screen: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  public readonly object3D: THREE.Object3D;
  public readonly label: string;
  public readonly interactives: InteractiveEntity[] = [];

  private readonly config: PanelConfig;
  private readonly frameMaterial: THREE.MeshStandardMaterial;
  private readonly screenMaterial: THREE.MeshBasicMaterial;
  private readonly texture: THREE.CanvasTexture;
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private dashboardMetrics: DashboardMetric[] = [];
  private interactionContext?: InteractionContext;
  private time = 0;
  private readonly baseY: number;
  private isHovered = false;
  private loadProgress = 0;
  private isUnlocked = false;
  private readonly loadSpeed;
  private readonly canvasDimensions: { width: number; height: number };
  private readonly screenDimensions: { width: number; height: number };

  private constructor(config: PanelConfig) {
    this.config = config;
    this.label = config.title;
    this.group.name = `panel-${config.id}`;

    const canvasWidth = config.canvasSize?.[0] ?? 1024;
    const canvasHeight = config.canvasSize?.[1] ?? 1024;
    this.canvasDimensions = { width: canvasWidth, height: canvasHeight };
    [this.canvas, this.context] = createCanvas(canvasWidth, canvasHeight);
    this.texture = new THREE.CanvasTexture(this.canvas);

    const frameWidth = config.panelSize?.[0] ?? 3;
    const frameHeight = config.panelSize?.[1] ?? 2.25;
    this.screenDimensions = {
      width: frameWidth - 0.28,
      height: frameHeight - 0.25,
    };

    this.frameMaterial = new THREE.MeshStandardMaterial({
      color: "#d7e7ef",
      metalness: 0.18,
      roughness: 0.64,
      emissive: "#daf6ff",
      emissiveIntensity: 0.1,
    });
    this.frame = new THREE.Mesh(new THREE.BoxGeometry(frameWidth, frameHeight, 0.12), this.frameMaterial);
    this.frame.castShadow = true;
    this.frame.receiveShadow = true;
    this.group.add(this.frame);

    this.screenMaterial = new THREE.MeshBasicMaterial({
      map: this.texture,
      color: "#ffffff",
      transparent: true,
      toneMapped: false,
    });

    this.screen = new THREE.Mesh(
      new THREE.PlaneGeometry(this.screenDimensions.width, this.screenDimensions.height),
      this.screenMaterial,
    );
    this.screen.position.z = 0.07;
    this.group.add(this.screen);

    const stand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.11, 1.2, 12),
        new THREE.MeshStandardMaterial({
          color: "#c7dbe5",
          emissive: "#edfaff",
          emissiveIntensity: 0.05,
          metalness: 0.18,
          roughness: 0.62,
        }),
    );
    stand.position.set(0, -(frameHeight / 2) - 0.5, 0);
    this.group.add(stand);

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.64, 0.7, 0.1, 18),
      new THREE.MeshStandardMaterial({
        color: "#d9e6ee",
        emissive: "#f4fdff",
        emissiveIntensity: 0.04,
        metalness: 0.14,
        roughness: 0.7,
      }),
    );
    base.position.set(0, -(frameHeight / 2) - 1.1, 0);
    this.group.add(base);

    this.group.position.set(config.position[0], config.position[1], config.position[2]);
    this.baseY = config.position[1];
    this.group.rotation.y = config.rotationY ?? 0;
    this.object3D = this.screen;
    this.loadSpeed = 26 + Math.random() * 18;
    if (config.type === "text" || config.embed) {
      this.isUnlocked = true;
      this.loadProgress = 100;
    }

    this.renderTexture();
  }

  static async create(config: PanelConfig): Promise<PanelEntity> {
    const panel = new PanelEntity(config);
    if (config.type === "dashboard" && config.data) {
      panel.dashboardMetrics = await panel.loadDashboardMetrics(config.data);
      panel.renderTexture();
    }
    return panel;
  }

  attachInteractionContext(context: InteractionContext): void {
    this.interactionContext = context;
  }

  setHovered(hovered: boolean): void {
    this.isHovered = hovered;
    this.frameMaterial.emissiveIntensity = hovered ? 0.24 : 0.1;
    this.screenMaterial.color.set(hovered ? "#f7fdff" : "#ffffff");
    this.group.position.y = this.baseY + (hovered ? 0.04 : 0);
  }

  interact(): void {
    if (!this.isUnlocked) {
      this.interactionContext?.overlay.setStatus(this.config.title, "Surface locked. Keep focus on it to finish loading.");
      return;
    }

    if (this.config.url) {
      window.open(this.config.url, "_blank", "noopener,noreferrer");
      this.interactionContext?.overlay.setStatus(this.config.title, "Opened source link in a new tab.");
      return;
    }

    this.interactionContext?.overlay.setStatus(this.config.title, "This surface is informational and already rendered in-world.");
  }

  update(deltaTime: number): void {
    this.time += deltaTime;
    const effectiveHoverOffset = this.frameMaterial.emissiveIntensity > 0.18 ? 0.04 : 0;
    this.group.position.y = this.baseY + effectiveHoverOffset + Math.sin(this.time * 1.6) * 0.018;

    if (!this.isUnlocked && this.isHovered) {
      this.loadProgress = Math.min(100, this.loadProgress + deltaTime * this.loadSpeed);
      if (this.loadProgress >= 100) {
        this.isUnlocked = true;
      }
      this.renderTexture();
    }
  }

  private async loadDashboardMetrics(path: string): Promise<DashboardMetric[]> {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load dashboard data from ${path}`);
    }

    const payload = (await response.json()) as { metrics: DashboardMetric[] };
    return payload.metrics;
  }

  private renderTexture(): void {
    const { context, canvas } = this;
    const accent = this.config.color ?? "#469cc3";
    drawFrame(context, canvas.width, canvas.height, accent);

    if (!this.isUnlocked) {
      this.drawLockedSurface(context, accent);
      this.texture.needsUpdate = true;
      return;
    }

    if (this.config.tags?.includes("resume")) {
      this.drawResumeSurface(context);
      this.texture.needsUpdate = true;
      return;
    }

    context.fillStyle = "rgba(25, 61, 78, 0.98)";
    context.font = "700 44px IBM Plex Mono, monospace";
    context.fillText(this.config.title.toUpperCase(), 48, 80);

    context.fillStyle = "rgba(19, 48, 62, 0.98)";
    context.font = "500 26px IBM Plex Mono, monospace";
    context.fillText(this.config.type === "dashboard" ? "OBSERVABILITY SURFACE" : this.config.type === "web" ? "WEB SURFACE" : "CAREER NODE", 48, 122);

    if (this.config.tags?.length) {
      context.fillStyle = "rgba(43, 102, 124, 0.98)";
      context.font = "500 20px IBM Plex Mono, monospace";
      context.fillText(this.config.tags.map((tag) => `#${tag}`).join("  "), 48, 156);
    }

    const contentTop = this.config.tags?.length ? 208 : 188;
    context.fillStyle = "rgba(14, 29, 38, 0.94)";
    context.font = "400 24px IBM Plex Mono, monospace";
    const summaryWidth = this.config.imageUrl ? 520 : 928;
    let nextY = wrapText(context, this.config.summary, 48, contentTop, summaryWidth, 34, 4);

    if (this.config.type === "text") {
      if (this.config.imageUrl) {
        this.drawProfileImage(context);
      }
      nextY += 12;
      context.fillStyle = "rgba(28, 53, 66, 0.92)";
      nextY = wrapText(
        context,
        this.config.content ?? "",
        48,
        nextY,
        this.config.imageUrl ? 520 : 928,
        30,
        7,
      );
      if (this.config.links?.length) {
        this.syncLinkHotspots(drawLinks(context, this.config.links, nextY + 10));
      }
    }

    if (this.config.type === "dashboard") {
      this.drawDashboard(context);
    }

    if (this.config.type === "web") {
      this.drawWebSurface(context);
    }

    context.strokeStyle = "rgba(112, 182, 206, 0.7)";
    context.strokeRect(40, 174, canvas.width - 80, canvas.height - 214);
    this.texture.needsUpdate = true;
  }

  private syncLinkHotspots(badges: LinkBadge[]): void {
    this.interactives.forEach((entity) => {
      this.group.remove(entity.object3D);
    });
    this.interactives.length = 0;
    badges.forEach((badge) => {
      const entity = new PanelLinkEntity(
        `${this.config.title} // ${badge.link.label}`,
        badge.link.url,
        badge.rect,
        this.screenDimensions,
        this.canvasDimensions,
        () => this.isUnlocked,
      );
      this.interactives.push(entity);
      this.group.add(entity.object3D);
    });
  }

  private drawLockedSurface(context: CanvasRenderingContext2D, accent: string): void {
    const percent = Math.round(this.loadProgress);
    const bars = 10;
    const filled = Math.floor((percent / 100) * bars);
    const loadingText = `${"█".repeat(filled)}${"░".repeat(bars - filled)} ${String(percent).padStart(2, "0")}%`;

    context.fillStyle = "rgba(25, 61, 78, 0.98)";
    context.font = "700 46px IBM Plex Mono, monospace";
    context.fillText(this.config.title.toUpperCase(), 48, 88);

    context.fillStyle = "rgba(19, 48, 62, 0.96)";
    context.font = "500 25px IBM Plex Mono, monospace";
    context.fillText("SURFACE LOCKED // visual stream initializing", 48, 142);

    context.strokeStyle = "rgba(137, 187, 206, 0.8)";
    context.strokeRect(48, 214, 928, 528);

    context.fillStyle = "rgba(69, 123, 148, 0.92)";
    context.font = "700 56px IBM Plex Mono, monospace";
    context.fillText(loadingText, 92, 352);

    context.fillStyle = "rgba(28, 53, 66, 0.9)";
    context.font = "400 24px IBM Plex Mono, monospace";
    context.fillText("Focus on the panel to complete the load sequence.", 92, 420);
    context.fillText(`stream target: ${this.config.type}`, 92, 474);
    context.fillText(`status: ${this.isHovered ? "decoding active" : "awaiting focus lock"}`, 92, 528);

    context.fillStyle = "rgba(132, 180, 198, 0.24)";
    context.fillRect(92, 590, 820, 20);
    context.fillStyle = accent;
    context.fillRect(92, 590, (820 * percent) / 100, 20);
  }

  private drawProfileImage(context: CanvasRenderingContext2D): void {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = this.config.imageUrl ?? "";
    image.onload = () => {
      context.save();
      context.fillStyle = "#edf7fb";
      context.fillRect(612, 204, 340, 420);
      context.drawImage(image, 628, 220, 308, 308);
      context.strokeStyle = "rgba(86, 154, 180, 0.9)";
      context.lineWidth = 6;
      context.strokeRect(628, 220, 308, 308);
      context.fillStyle = "rgba(26, 48, 59, 0.88)";
      context.font = "400 18px IBM Plex Mono, monospace";
      context.fillText("portrait // developer profile", 628, 556);
      context.restore();
      this.texture.needsUpdate = true;
    };
  }

  private drawResumeImage(context: CanvasRenderingContext2D): void {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = this.config.imageUrl ?? "";
    image.onload = () => {
      context.save();
      const frameX = 64;
      const frameY = 188;
      const frameWidth = this.canvas.width - 128;
      const frameHeight = this.canvas.height - 356;

      context.fillStyle = "#f3f8fb";
      context.fillRect(frameX, frameY, frameWidth, frameHeight);
      context.strokeStyle = "rgba(86, 154, 180, 0.7)";
      context.lineWidth = 6;
      context.strokeRect(frameX, frameY, frameWidth, frameHeight);

      drawContainedImage(context, image, frameX + 12, frameY + 12, frameWidth - 24, frameHeight - 24);

      context.fillStyle = "rgba(28, 53, 66, 0.82)";
      context.font = "400 16px IBM Plex Mono, monospace";
      context.fillText("résumé preview // full page surface", frameX, frameY + frameHeight + 32);
      context.restore();
      this.texture.needsUpdate = true;
    };
  }

  private drawResumeSurface(context: CanvasRenderingContext2D): void {
    context.fillStyle = "rgba(25, 61, 78, 0.98)";
    context.font = "700 44px IBM Plex Mono, monospace";
    context.fillText(this.config.title.toUpperCase(), 48, 80);

    context.fillStyle = "rgba(19, 48, 62, 0.98)";
    context.font = "500 26px IBM Plex Mono, monospace";
    context.fillText("DOCUMENT SURFACE", 48, 122);

    if (this.config.tags?.length) {
      context.fillStyle = "rgba(43, 102, 124, 0.98)";
      context.font = "500 20px IBM Plex Mono, monospace";
      context.fillText(this.config.tags.map((tag) => `#${tag}`).join("  "), 48, 156);
    }

    if (this.config.links?.length) {
      this.syncLinkHotspots(drawLinks(context, this.config.links, this.canvas.height - 100));
    }

    this.drawResumeImage(context);

    context.fillStyle = "rgba(28, 53, 66, 0.84)";
    context.font = "400 18px IBM Plex Mono, monospace";
    context.fillText("mouse wheel // zoom view", 48, this.canvas.height - 126);

    context.strokeStyle = "rgba(112, 182, 206, 0.7)";
    context.strokeRect(40, 174, this.canvas.width - 80, this.canvas.height - 214);
  }

  private drawDashboard(context: CanvasRenderingContext2D): void {
    const fallbackMetrics: DashboardMetric[] = [
      {
        id: "signal",
        label: "Signal Accuracy",
        value: 0,
        unit: "%",
        placeholder: "connect metric source",
        status: "placeholder",
        source: "quality.signal_accuracy",
      },
      {
        id: "rootcause",
        label: "Root Cause Coverage",
        value: 0,
        unit: "%",
        placeholder: "awaiting integration",
        status: "placeholder",
        source: "quality.root_cause_coverage",
      },
    ];

    const metrics = this.dashboardMetrics.length
      ? this.dashboardMetrics
      : fallbackMetrics;

    context.fillStyle = "rgba(48, 118, 142, 0.92)";
    context.font = "600 22px IBM Plex Mono, monospace";
    context.fillText("Live inputs / placeholders", 48, 338);

    context.strokeStyle = "rgba(127, 187, 208, 0.75)";
    context.strokeRect(48, 364, 928, 356);

    const maxNumeric = Math.max(
      ...metrics
        .map((metric) => (typeof metric.value === "number" ? metric.value : 0))
        .concat(100),
    );

    metrics.slice(0, 4).forEach((metric, index) => {
      const top = 412 + index * 78;
      const numeric = typeof metric.value === "number" ? metric.value : 0;
      const width = (numeric / maxNumeric) * 360;

      context.fillStyle = "rgba(22, 41, 52, 0.95)";
      context.font = "400 20px IBM Plex Mono, monospace";
      context.fillText(metric.label, 66, top);
      context.fillStyle = metric.status === "placeholder" ? "rgba(168, 108, 0, 0.92)" : "rgba(42, 125, 154, 0.92)";
      context.fillText(
        `${metric.value}${metric.unit ?? ""}${metric.placeholder ? `  // ${metric.placeholder}` : ""}`,
        430,
        top,
      );

      context.fillStyle = "rgba(108, 191, 224, 0.92)";
      context.fillRect(66, top + 18, width, 12);
      context.strokeStyle = "rgba(85, 140, 160, 0.42)";
      context.strokeRect(66, top + 18, 360, 12);

      if (metric.source) {
        context.fillStyle = "rgba(63, 118, 138, 0.8)";
        context.font = "400 14px IBM Plex Mono, monospace";
        context.fillText(`source: ${metric.source}`, 66, top + 48);
      }
    });
  }

  private drawWebSurface(context: CanvasRenderingContext2D): void {
    context.fillStyle = "rgba(48, 118, 142, 0.92)";
    context.font = "600 22px IBM Plex Mono, monospace";
    context.fillText("Embeddable web surface", 48, 338);

    context.strokeStyle = "rgba(127, 187, 208, 0.75)";
    context.strokeRect(48, 364, 928, 476);

    context.fillStyle = "rgba(20, 38, 48, 0.92)";
    context.font = "400 21px IBM Plex Mono, monospace";
    wrapText(
      context,
      "This panel is prepared for embeddable content. For arbitrary external pages, browsers can block in-panel rendering via X-Frame-Options or CSP headers.",
      68,
      414,
      888,
      30,
      6,
    );

    context.fillStyle = "rgba(43, 119, 146, 0.94)";
    context.font = "400 20px IBM Plex Mono, monospace";
    context.fillText(`target: ${this.config.url ?? "not configured"}`, 68, 624);
    context.fillText("current mode: live metadata + direct link", 68, 666);
    context.fillText("phase 2 option: CSS3D / same-origin embed surface", 68, 706);
    context.fillText("press E to open source in a new tab", 68, 782);
  }
}
