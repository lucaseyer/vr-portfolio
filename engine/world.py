from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

import pygame


@dataclass
class CareerZone:
    name: str
    description: str
    start_x: int
    end_x: int


@dataclass
class NPC:
    id: str
    name: str
    rect: pygame.Rect
    dialogue: list[str]
    meta: list[str]
    zone: str

    def draw(self, surface: pygame.Surface, camera_x: int, scan_mode: bool, in_range: bool) -> None:
        screen_rect = self.rect.move(-camera_x, 0)
        color = pygame.Color("white")
        border = 3 if scan_mode or in_range else 0
        pygame.draw.rect(surface, color, screen_rect, border if border else 0)

        if border == 0:
            fill_rect = screen_rect.inflate(-6, -6)
            pygame.draw.rect(surface, color, fill_rect)

        if scan_mode:
            pulse_color = pygame.Color(180, 255, 180) if in_range else pygame.Color(140, 140, 140)
            pygame.draw.rect(surface, pulse_color, screen_rect.inflate(12, 12), 2)


class World:
    def __init__(self, base_path: Path) -> None:
        self.base_path = base_path
        self.story = self._load_json("story.json")
        self.projects = self._load_json("projects.json")
        self.level_width = self.story["world"]["width"]
        self.level_height = self.story["world"]["height"]
        self.spawn_point = tuple(self.story["world"]["spawn"])
        self.floor_y = self.story["world"]["floor_y"]
        self.solids = self._build_solids()
        self.zones = [CareerZone(**zone) for zone in self.story["zones"]]
        self.npcs = self._build_npcs()

    def _load_json(self, filename: str) -> dict:
        with (self.base_path / filename).open("r", encoding="utf-8") as file:
            return json.load(file)

    def _build_solids(self) -> list[pygame.Rect]:
        solids = []
        for solid in self.story["solids"]:
            solids.append(pygame.Rect(solid["x"], solid["y"], solid["width"], solid["height"]))
        return solids

    def _build_npcs(self) -> list[NPC]:
        project_index = {project["id"]: project for project in self.projects["projects"]}
        npcs = []

        for npc_data in self.story["npcs"]:
            project = project_index[npc_data["project_id"]]
            rect = pygame.Rect(npc_data["x"], npc_data["y"], npc_data["width"], npc_data["height"])
            # Story layout and portfolio copy live in JSON so the experience can evolve without engine changes.
            npcs.append(
                NPC(
                    id=project["id"],
                    name=project["name"],
                    rect=rect,
                    dialogue=project["dialogue"],
                    meta=project["meta"],
                    zone=npc_data["zone"],
                )
            )
        return npcs

    def draw(self, surface: pygame.Surface, camera_x: int, font: pygame.font.Font, scan_mode: bool, player_rect: pygame.Rect) -> None:
        surface.fill(pygame.Color("black"))
        self._draw_grid(surface, camera_x)
        self._draw_zones(surface, camera_x, font)
        self._draw_solids(surface, camera_x)

        for npc in self.npcs:
            npc.draw(surface, camera_x, scan_mode, self.is_in_interaction_range(player_rect, npc))
            self._draw_npc_label(surface, font, npc, camera_x, scan_mode)

    def _draw_grid(self, surface: pygame.Surface, camera_x: int) -> None:
        width = surface.get_width()
        height = surface.get_height()
        grid_step = 48

        start_x = -(camera_x % grid_step)
        for x in range(start_x, width, grid_step):
            pygame.draw.line(surface, pygame.Color(25, 25, 25), (x, 0), (x, height))

        for y in range(0, height, grid_step):
            pygame.draw.line(surface, pygame.Color(25, 25, 25), (0, y), (width, y))

    def _draw_zones(self, surface: pygame.Surface, camera_x: int, font: pygame.font.Font) -> None:
        for zone in self.zones:
            zone_rect = pygame.Rect(zone.start_x - camera_x, 0, zone.end_x - zone.start_x, surface.get_height())
            pygame.draw.rect(surface, pygame.Color(12, 12, 12), zone_rect, 1)

            label = font.render(zone.name.upper(), True, pygame.Color("white"))
            surface.blit(label, (zone_rect.x + 28, 36))

            description = font.render(zone.description, True, pygame.Color(160, 160, 160))
            surface.blit(description, (zone_rect.x + 28, 68))

    def _draw_solids(self, surface: pygame.Surface, camera_x: int) -> None:
        for solid in self.solids:
            pygame.draw.rect(surface, pygame.Color("white"), solid.move(-camera_x, 0), 2)

    def _draw_npc_label(
        self,
        surface: pygame.Surface,
        font: pygame.font.Font,
        npc: NPC,
        camera_x: int,
        scan_mode: bool,
    ) -> None:
        name = font.render(npc.name, True, pygame.Color("white"))
        label_x = npc.rect.centerx - camera_x - name.get_width() // 2
        label_y = npc.rect.y - 34
        surface.blit(name, (label_x, label_y))

        if scan_mode:
            for index, meta in enumerate(npc.meta):
                rendered = font.render(meta, True, pygame.Color(180, 255, 180))
                surface.blit(rendered, (label_x, label_y - 22 * (index + 1)))

    def get_closest_npc(self, player_rect: pygame.Rect, max_distance: int = 90) -> NPC | None:
        candidates = [npc for npc in self.npcs if self.is_in_interaction_range(player_rect, npc, max_distance)]
        if not candidates:
            return None
        return min(candidates, key=lambda npc: abs(npc.rect.centerx - player_rect.centerx))

    def is_in_interaction_range(self, player_rect: pygame.Rect, npc: NPC, max_distance: int = 90) -> bool:
        horizontal_distance = abs(player_rect.centerx - npc.rect.centerx)
        vertical_distance = abs(player_rect.centery - npc.rect.centery)
        return horizontal_distance <= max_distance and vertical_distance <= 90
