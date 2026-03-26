import { InputController } from "../core/input";

export class OverlayUI {
  private readonly uiLayer: HTMLDivElement;
  private readonly introShell: HTMLDivElement;
  private readonly statusCard: HTMLDivElement;
  private readonly instructions: HTMLDivElement;
  private readonly input: InputController;

  constructor(root: HTMLElement, input: InputController) {
    this.input = input;
    this.uiLayer = document.createElement("div");
    this.uiLayer.className = "ui-layer";

    const reticle = document.createElement("div");
    reticle.className = "reticle";
    this.uiLayer.appendChild(reticle);

    this.instructions = document.createElement("div");
    this.instructions.className = "hud-card instructions";
    this.uiLayer.appendChild(this.instructions);

    this.statusCard = document.createElement("div");
    this.statusCard.className = "hud-card status";
    this.uiLayer.appendChild(this.statusCard);

    this.introShell = document.createElement("div");
    this.introShell.className = "intro-shell";
    this.introShell.innerHTML = `
      <div class="intro-card">
        <p class="intro-kicker">Spatial Developer Portfolio</p>
        <h1>CAREER JOURNEY LAB</h1>
        <p>This is the story of my life as a developer, Lucas Eyer, built to explore a technological curiosity of mine in spatial form.</p>
        <button class="intro-play">▶ PLAY MY CAREER</button>
      </div>
    `;

    const playButton = this.introShell.querySelector<HTMLButtonElement>(".intro-play");
    playButton?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.dismissIntro();
    });

    root.appendChild(this.uiLayer);
    root.appendChild(this.introShell);
  }

  showInstructions(): void {
    this.instructions.innerHTML = `
      <h1>Developer Lab</h1>
      <p>WASD to move, click the room to enable mouse look, E or click to interact.</p>
      <p>Press Esc any time to release the mouse. Work-experience buttons project content into the live-site panel.</p>
    `;
    this.setStatus("System ready", "Click PLAY MY CAREER to enter the room.");
  }

  setStatus(title: string, body: string): void {
    this.statusCard.innerHTML = `<strong>${title}</strong><p>${body}</p>`;
  }

  setFocusTarget(label: string | null): void {
    if (!label) {
      this.setStatus("Exploration", "Aim at a panel or terminal action to inspect it.");
      return;
    }

    this.setStatus("In focus", `${label} ready. Press E or click to interact.`);
  }

  dismissIntro(): void {
    this.input.clearTransientInputs();
    this.introShell.classList.add("is-hidden");
    this.setStatus("Inside the lab", "Click the room when you want mouse look. Press Esc to free the cursor.");
  }

  isIntroVisible(): boolean {
    return !this.introShell.classList.contains("is-hidden");
  }
}
