from __future__ import annotations

import pygame


class DialogueBox:
    def __init__(self, viewport_size: tuple[int, int]) -> None:
        self.viewport_width, self.viewport_height = viewport_size
        self.title_font = pygame.font.SysFont("couriernew", 28, bold=True)
        self.body_font = pygame.font.SysFont("couriernew", 22)
        self.hint_font = pygame.font.SysFont("couriernew", 18)
        self.active_entry: dict | None = None
        self.visible = False

    def show(self, entry: dict) -> None:
        self.active_entry = entry
        self.visible = True

    def hide(self) -> None:
        self.active_entry = None
        self.visible = False

    def toggle(self, entry: dict) -> None:
        if self.visible and self.active_entry == entry:
            self.hide()
        else:
            self.show(entry)

    def draw(self, surface: pygame.Surface) -> None:
        if not self.visible or not self.active_entry:
            return

        box = pygame.Rect(60, self.viewport_height - 220, self.viewport_width - 120, 160)
        pygame.draw.rect(surface, pygame.Color("black"), box)
        pygame.draw.rect(surface, pygame.Color("white"), box, 3)

        title = self.title_font.render(self.active_entry["name"], True, pygame.Color("white"))
        surface.blit(title, (box.x + 24, box.y + 18))

        for index, line in enumerate(self.active_entry["dialogue"]):
            rendered = self.body_font.render(line, True, pygame.Color("white"))
            surface.blit(rendered, (box.x + 24, box.y + 58 + index * 30))

        prompt = self.hint_font.render("E: close dialogue", True, pygame.Color("white"))
        surface.blit(prompt, (box.right - prompt.get_width() - 24, box.bottom - 34))
