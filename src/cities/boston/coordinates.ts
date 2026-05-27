// Neighborhood centroids. The Tech Week calendar only gives neighborhood-level
// location data, so multiple events in the same neighborhood will share a pin.
// Refine to specific venue coords if/when better data is available.
export const VENUE_COORDS: Record<string, [number, number]> = {
  "Back Bay, Boston, MA": [42.3503, -71.0810],
  "Seaport District, Boston, MA": [42.3520, -71.0440],
  "Kendall Square, Cambridge, MA": [42.3625, -71.0855],
  "Cambridge, MA": [42.3736, -71.1097],
  "Downtown, Boston, MA": [42.3580, -71.0590],
  "Allston, Boston, MA": [42.3535, -71.1320],
  "Fenway-Kenmore, Boston, MA": [42.3467, -71.0972],
  "Somerville, MA": [42.3876, -71.0995],
  "Brookline, MA": [42.3318, -71.1212],
  "Boston, MA": [42.3601, -71.0589],
};
