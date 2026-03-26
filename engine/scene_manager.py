from __future__ import annotations


class SceneManager:
    def __init__(self) -> None:
        self.scenes: dict[str, object] = {}
        self.current_scene = None
        self.is_running = True

    def register(self, name: str, scene: object) -> None:
        self.scenes[name] = scene

    def go_to(self, name: str) -> None:
        self.current_scene = self.scenes[name]
        if hasattr(self.current_scene, "enter"):
            self.current_scene.enter()

    def stop(self) -> None:
        self.is_running = False

    def handle_events(self, events: list) -> None:
        if self.current_scene:
            self.current_scene.handle_events(events)

    def update(self, dt: float) -> None:
        if self.current_scene:
            self.current_scene.update(dt)

    def render(self, surface) -> None:
        if self.current_scene:
            self.current_scene.render(surface)
