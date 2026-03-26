import sys

import pygame

from engine.scene_manager import SceneManager
from engine.scenes import GameScene, MainMenuScene


WINDOW_WIDTH = 1280
WINDOW_HEIGHT = 720
FPS = 60


def main() -> None:
    pygame.init()
    pygame.display.set_caption("Career Journey")
    screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
    clock = pygame.time.Clock()

    scene_manager = SceneManager()
    scene_manager.register("menu", MainMenuScene(scene_manager, (WINDOW_WIDTH, WINDOW_HEIGHT)))
    scene_manager.register("game", GameScene(scene_manager, (WINDOW_WIDTH, WINDOW_HEIGHT)))
    scene_manager.go_to("menu")

    while scene_manager.is_running:
        dt = clock.tick(FPS) / 1000
        events = pygame.event.get()

        for event in events:
            if event.type == pygame.QUIT:
                scene_manager.stop()

        scene_manager.handle_events(events)
        scene_manager.update(dt)
        scene_manager.render(screen)
        pygame.display.flip()

    pygame.quit()
    sys.exit(0)


if __name__ == "__main__":
    main()
