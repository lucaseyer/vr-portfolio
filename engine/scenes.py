from __future__ import annotations

from pathlib import Path

import pygame

from engine.dialogue import DialogueBox
from engine.player import Player
from engine.world import World


class BaseScene:
    def __init__(self, manager, viewport_size: tuple[int, int]) -> None:
        self.manager = manager
        self.viewport_size = viewport_size

    def enter(self) -> None:
        pass

    def handle_events(self, events: list[pygame.event.Event]) -> None:
        pass

    def update(self, dt: float) -> None:
        pass

    def render(self, surface: pygame.Surface) -> None:
        pass


class MainMenuScene(BaseScene):
    def __init__(self, manager, viewport_size: tuple[int, int]) -> None:
        super().__init__(manager, viewport_size)
        self.title_font = pygame.font.SysFont("couriernew", 48, bold=True)
        self.body_font = pygame.font.SysFont("couriernew", 24)

    def handle_events(self, events: list[pygame.event.Event]) -> None:
        for event in events:
            if event.type == pygame.KEYDOWN:
                if event.key in (pygame.K_RETURN, pygame.K_SPACE):
                    self.manager.go_to("game")
                elif event.key == pygame.K_ESCAPE:
                    self.manager.stop()

    def render(self, surface: pygame.Surface) -> None:
        surface.fill(pygame.Color("black"))
        width, height = self.viewport_size

        title = self.title_font.render("CAREER JOURNEY", True, pygame.Color("white"))
        subtitle = self.body_font.render("A playable developer portfolio in retro form.", True, pygame.Color("white"))
        controls = self.body_font.render("Enter to start  |  Arrows / A-D to move  |  Space to jump", True, pygame.Color("white"))
        scan = self.body_font.render("E to inspect portfolio nodes  |  Tab for scan mode", True, pygame.Color("white"))

        surface.blit(title, (width // 2 - title.get_width() // 2, 220))
        surface.blit(subtitle, (width // 2 - subtitle.get_width() // 2, 320))
        surface.blit(controls, (width // 2 - controls.get_width() // 2, 390))
        surface.blit(scan, (width // 2 - scan.get_width() // 2, 430))

        frame = pygame.Rect(160, 150, width - 320, 380)
        pygame.draw.rect(surface, pygame.Color("white"), frame, 3)


class GameScene(BaseScene):
    def __init__(self, manager, viewport_size: tuple[int, int]) -> None:
        super().__init__(manager, viewport_size)
        content_path = Path(__file__).resolve().parent.parent / "content"
        # The scene owns orchestration only; gameplay systems stay isolated in dedicated modules.
        self.world = World(content_path)
        self.player = Player(self.world.spawn_point)
        self.dialogue = DialogueBox(viewport_size)
        self.camera_x = 0
        self.scan_mode = False
        self.ui_font = pygame.font.SysFont("couriernew", 20)
        self.title_font = pygame.font.SysFont("couriernew", 24, bold=True)

    def enter(self) -> None:
        self.player = Player(self.world.spawn_point)
        self.dialogue.hide()
        self.scan_mode = False
        self.camera_x = 0

    def handle_events(self, events: list[pygame.event.Event]) -> None:
        for event in events:
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    self.manager.go_to("menu")
                elif event.key == pygame.K_TAB:
                    self.scan_mode = not self.scan_mode
                elif event.key == pygame.K_e:
                    npc = self.world.get_closest_npc(self.player.rect)
                    if npc:
                        entry = {"name": npc.name, "dialogue": npc.dialogue}
                        self.dialogue.toggle(entry)

    def update(self, dt: float) -> None:
        if not self.dialogue.visible:
            self.player.update(dt, self.world.solids)

        # Camera tracking is clamped to the world bounds so content scrolls without exposing empty space.
        half_width = self.viewport_size[0] // 2
        target = self.player.rect.centerx - half_width
        self.camera_x = max(0, min(target, self.world.level_width - self.viewport_size[0]))

    def render(self, surface: pygame.Surface) -> None:
        self.world.draw(surface, self.camera_x, self.ui_font, self.scan_mode, self.player.rect)
        self.player.draw(surface, self.camera_x)
        self._draw_hud(surface)
        self.dialogue.draw(surface)

    def _draw_hud(self, surface: pygame.Surface) -> None:
        title = self.title_font.render("Interactive Portfolio // Developer Timeline", True, pygame.Color("white"))
        surface.blit(title, (24, 18))

        hint = "Move: arrows / A-D  Jump: space  Interact: E  Scan: Tab  Menu: Esc"
        hint_render = self.ui_font.render(hint, True, pygame.Color("white"))
        surface.blit(hint_render, (24, 52))

        current_npc = self.world.get_closest_npc(self.player.rect)
        if current_npc:
            prompt = self.ui_font.render(f"[E] inspect {current_npc.name}", True, pygame.Color(180, 255, 180))
            surface.blit(prompt, (24, 84))

        if self.scan_mode:
            scan = self.ui_font.render("SCAN MODE ACTIVE // metadata overlay enabled", True, pygame.Color(180, 255, 180))
            surface.blit(scan, (24, 112))
