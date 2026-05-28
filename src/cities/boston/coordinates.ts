// Neighborhood centroids. The Tech Week calendar only gives neighborhood-level
// location data, so multiple events in the same neighborhood will share a pin.
// Refine to specific venue coords if/when better data is available.
export const VENUE_COORDS: Record<string, [number, number]> = {
  "Back Bay, Boston, MA": [42.3503, -71.0810],
  "Beacon Hill, Boston, MA": [42.3588, -71.0707],
  "Bay Village, Boston, MA": [42.3496, -71.0682],
  "Brighton, Boston, MA": [42.3493, -71.1593],
  "Brookline, MA": [42.3318, -71.1212],
  "Cambridge, MA": [42.3736, -71.1097],
  "Charlestown, Boston, MA": [42.3782, -71.0602],
  "Chelsea, MA": [42.3917, -71.0328],
  "Chinatown, Boston, MA": [42.3514, -71.0617],
  "Downtown, Boston, MA": [42.3580, -71.0590],
  "Everett, MA": [42.4084, -71.0537],
  "Fenway-Kenmore, Boston, MA": [42.3467, -71.0972],
  "Kendall Square, Cambridge, MA": [42.3625, -71.0855],
  "North End, Boston, MA": [42.3650, -71.0533],
  "Seaport District, Boston, MA": [42.3520, -71.0440],
  "Somerville, MA": [42.3876, -71.0995],
  "South Boston, MA": [42.3340, -71.0480],
  "South End, Boston, MA": [42.3408, -71.0788],
  "West End, Boston, MA": [42.3637, -71.0625],
  "Allston, Boston, MA": [42.3535, -71.1320],
  "Boston, MA": [42.3601, -71.0589],
};
