import * as THREE from "three";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";

import { PanelConfig } from "../types";

export class EmbeddedWebSurface {
  public readonly object3D: THREE.Object3D;

  constructor(config: PanelConfig) {
    if (!config.url) {
      throw new Error(`Missing embed URL for panel ${config.id}`);
    }

    const frameWidth = config.panelSize?.[0] ?? 3;
    const frameHeight = config.panelSize?.[1] ?? 2.25;
    const screenWidth = frameWidth - 0.28;
    const screenHeight = frameHeight - 0.25;

    const widthPx = 1280;
    const heightPx = Math.round((screenHeight / screenWidth) * widthPx);

    const shell = document.createElement("div");
    shell.className = "embedded-web-surface";
    shell.style.width = `${widthPx}px`;
    shell.style.height = `${heightPx}px`;

    const header = document.createElement("div");
    header.className = "embedded-web-header";
    header.innerHTML = `
      <span class="embedded-web-dot"></span>
      <span class="embedded-web-title">${config.title}</span>
      <span class="embedded-web-url">${config.url.replace(/^https?:\/\//, "")}</span>
    `;

    const viewport = document.createElement("div");
    viewport.className = "embedded-web-viewport";

    const iframe = document.createElement("iframe");
    iframe.className = "embedded-web-frame";
    iframe.src = config.url;
    iframe.title = config.title;
    iframe.loading = "eager";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.setAttribute("allow", "fullscreen");

    viewport.appendChild(iframe);
    shell.append(header, viewport);

    const object = new CSS3DObject(shell);
    object.position.set(0, -0.02, 0.081);
    object.scale.set(screenWidth / widthPx, screenHeight / heightPx, 1);
    this.object3D = object;
  }
}
