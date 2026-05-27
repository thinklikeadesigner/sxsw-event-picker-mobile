export interface RawEvent {
  uid: string;
  summary: string;
  description?: string;
  dtstart: string;
  dtend: string;
  url: string;
  location: string;
  cost: string;
  type: string;
  rawBlock: string;
}

export interface CityEvent {
  uid: string;
  summary: string;
  description: string;
  start: Date;
  end: Date;
  url: string;
  location: string;
  cost: string;
  type: string;
  rawBlock: string;
  index: number;
  tags: string[];
}

export interface Conflict {
  id: string;
  eventA: number;
  eventB: number;
  overlapMinutes: number;
  resolved: boolean;
  winner: number | null;
}

export type ViewMode = 'discover' | 'resolve' | 'schedule' | 'map';

export interface Filters {
  cost: string;
  type: string;
  search: string;
}

export interface LaunchConfig {
  slug: string;
  name: string;
  window?: { start: Date; end: Date };
  description?: string;
}

export interface CityConfig {
  slug: string;
  name: string;
  theme: Record<string, string>;
  map: { center: [number, number]; zoom: number };
  launches: LaunchConfig[];
  loadEvents: () => Promise<CityEvent[]>;
  loadCoordinates: () => Promise<Record<string, [number, number]>>;
}
