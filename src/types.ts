import { OverlayUI } from "./ui/overlay";

export type PanelType = "web" | "dashboard" | "text";

export interface LinkItem {
  label: string;
  url: string;
}

export interface PanelConfig {
  id: string;
  type: PanelType;
  title: string;
  summary: string;
  content?: string;
  url?: string;
  data?: string;
  links?: LinkItem[];
  imageUrl?: string;
  embed?: boolean;
  position: [number, number, number];
  rotationY?: number;
  panelSize?: [number, number];
  canvasSize?: [number, number];
  color?: string;
  tags?: string[];
}

export interface DashboardMetric {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  source?: string;
  placeholder?: string;
  status?: "live" | "placeholder";
}

export interface InteractionContext {
  overlay: OverlayUI;
  openEmbeddedPanel?: (id: string) => void;
}
