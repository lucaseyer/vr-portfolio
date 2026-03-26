import "./styles.css";

import panels from "./content/panels.json";
import { PortfolioEngine } from "./core/engine";
import { PortfolioCamera } from "./core/camera";
import { PortfolioRenderer } from "./core/renderer";
import { InputController } from "./core/input";
import { PortfolioScene } from "./core/scene";
import { ComputerTerminal } from "./entities/computerTerminal";
import { PanelEntity } from "./entities/panel";
import { InteractionSystem } from "./systems/interactionSystem";
import { NavigationSystem } from "./systems/navigationSystem";
import { OverlayUI } from "./ui/overlay";
import { createLighting } from "./world/lighting";
import { createRoom } from "./world/room";
import { PanelConfig } from "./types";

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
  const panelEntities = await Promise.all(
    (panels as PanelConfig[]).map((config) => PanelEntity.create(config)),
  );

  panelEntities.forEach((panel) => {
    room.mountPanel(panel);
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
