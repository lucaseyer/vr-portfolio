from __future__ import annotations

from dataclasses import dataclass

import pygame


@dataclass
class PlayerConfig:
    width: int = 42
    height: int = 64
    move_speed: float = 360.0
    jump_velocity: float = -760.0
    gravity: float = 2200.0


class Player:
    def __init__(self, spawn: tuple[int, int]) -> None:
        self.config = PlayerConfig()
        self.rect = pygame.Rect(spawn[0], spawn[1], self.config.width, self.config.height)
        self.velocity = pygame.Vector2(0, 0)
        self.on_ground = False
        self.facing = 1

    def update(self, dt: float, solids: list[pygame.Rect]) -> None:
        keys = pygame.key.get_pressed()

        direction = 0
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            direction -= 1
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            direction += 1

        self.velocity.x = direction * self.config.move_speed
        if direction != 0:
            self.facing = direction

        if self.on_ground and (keys[pygame.K_SPACE] or keys[pygame.K_w] or keys[pygame.K_UP]):
            self.velocity.y = self.config.jump_velocity
            self.on_ground = False

        self.velocity.y += self.config.gravity * dt

        self.rect.x += int(self.velocity.x * dt)
        self._resolve_horizontal_collisions(solids)

        self.rect.y += int(self.velocity.y * dt)
        self.on_ground = False
        self._resolve_vertical_collisions(solids)

    def _resolve_horizontal_collisions(self, solids: list[pygame.Rect]) -> None:
        for solid in solids:
            if self.rect.colliderect(solid):
                if self.velocity.x > 0:
                    self.rect.right = solid.left
                elif self.velocity.x < 0:
                    self.rect.left = solid.right

    def _resolve_vertical_collisions(self, solids: list[pygame.Rect]) -> None:
        for solid in solids:
            if self.rect.colliderect(solid):
                if self.velocity.y > 0:
                    self.rect.bottom = solid.top
                    self.velocity.y = 0
                    self.on_ground = True
                elif self.velocity.y < 0:
                    self.rect.top = solid.bottom
                    self.velocity.y = 0

    def draw(self, surface: pygame.Surface, camera_x: int) -> None:
        body = self.rect.move(-camera_x, 0)
        pygame.draw.rect(surface, pygame.Color("white"), body)

        eye_size = 6
        eye_x = body.centerx + (8 * self.facing) - eye_size // 2
        eye = pygame.Rect(eye_x, body.y + 18, eye_size, eye_size)
        pygame.draw.rect(surface, pygame.Color("black"), eye)
