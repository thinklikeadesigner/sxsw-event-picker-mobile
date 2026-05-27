import { CityConfig } from '../data/types';
import { austinConfig } from './austin/config';
import { nycConfig } from './nyc/config';

export const CITIES: Record<string, CityConfig> = {
  austin: austinConfig,
  nyc: nycConfig,
};

export function getCity(slug: string): CityConfig | null {
  return CITIES[slug] ?? null;
}

export function listCities(): CityConfig[] {
  return Object.values(CITIES);
}
