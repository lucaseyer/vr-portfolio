import "./styles.css";

import panels from "./content/panels.json";
import { PortfolioEngine } from "./core/engine";
import { PortfolioCamera } from "./core/camera";
import { PortfolioRenderer } from "./core/renderer";
import { InputController } from "./core/input";
import { PortfolioScene } from "./core/scene";
import { ComputerTerminal } from "./entities/computerTerminal";
import { EmbeddedWebSurface } from "./entities/embeddedWebSurface";
import { PanelEntity } from "./entities/panel";
import { InteractionSystem } from "./systems/interactionSystem";
import { NavigationSystem } from "./systems/navigationSystem";
import { OverlayUI } from "./ui/overlay";
import { createLighting } from "./world/lighting";
import { createRoom } from "./world/room";
import { PanelConfig } from "./types";

function withBaseUrl(path?: string): string | undefined {
  if (!path || !path.startsWith("/")) {
    return path;
  }

  const base = import.meta.env.BASE_URL;
  return `${base.replace(/\/$/, "")}${path}`;
}

async function bootstrap(): Promise<void> {
  const app = document.querySelector<HTMLDivElement>("#app");
  if (!app) {
    throw new Error("Missing #app container");
  }

  const renderer = new PortfolioRenderer(app);
  const camera = new PortfolioCamera(renderer.aspect);
  const input = new InputController(renderer.domElement);
  const overlay = new OverlayUI(app, input);
  const scene = new PortfolioScene();

  scene.add(createLighting());

  const room = createRoom();
  scene.add(room.group);

  // Panels are data-driven entities, so adding a new surface is a content change rather than a scene rewrite.
  const panelConfigs = (panels as PanelConfig[]).map((config) => ({
    ...config,
    imageUrl: withBaseUrl(config.imageUrl),
    data: withBaseUrl(config.data),
  }));

  const panelEntities = await Promise.all(
    panelConfigs.map((config) => PanelEntity.create(config)),
  );

  panelEntities.forEach((panel, index) => {
    room.mountPanel(panel);

    const config = panelConfigs[index];
    if (config.embed && config.url) {
      panel.group.add(new EmbeddedWebSurface(config).object3D);
    }
  });

  const terminal = new ComputerTerminal(overlay);
  room.group.add(terminal.group);

  const navigationSystem = new NavigationSystem(camera, input, room);
  const interactionSystem = new InteractionSystem(camera, renderer.domElement, input, {
    overlay,
    onInspect(entity) {
      entity.interact();
    },
  });

  panelEntities.forEach((panel) => interactionSystem.register(panel));
  panelEntities.forEach((panel) => panel.interactives.forEach((entity) => interactionSystem.register(entity)));
  terminal.interactives.forEach((entity) => interactionSystem.register(entity));

  const engine = new PortfolioEngine({
    camera,
    renderer,
    scene,
    systems: [
      navigationSystem,
      {
        update(deltaTime) {
          panelEntities.forEach((panel) => panel.update(deltaTime));
        },
      },
      interactionSystem,
    ],
    onResize: (aspect) => camera.resize(aspect),
  });

  overlay.showInstructions();
  engine.start();
}

bootstrap().catch((error) => {
  console.error(error);
  document.body.innerHTML = `<pre style="color:#fff;background:#050816;padding:24px;">${String(error)}</pre>`;
});
