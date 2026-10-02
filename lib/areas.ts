// Small gazetteer of Abu Dhabi areas → approximate coordinates.
// Used as a fallback so every report lands somewhere sensible on the map
// even when GPT doesn't return lat/lng.

export const ABU_DHABI_CENTER: [number, number] = [24.4539, 54.3773];

export const AREA_COORDS: Record<string, [number, number]> = {
  "al reem island": [24.4986, 54.4012],
  "reem island": [24.4986, 54.4012],
  "al reem": [24.4986, 54.4012],
  "khalifa city": [24.4219, 54.5783],
  "al raha beach": [24.4539, 54.6069],
  "al raha": [24.4539, 54.6069],
  "mussafah": [24.3569, 54.5028],
  "musaffah": [24.3569, 54.5028],
  "al danah": [24.4869, 54.3617],
  "corniche": [24.4752, 54.3217],
  "al khalidiyah": [24.4663, 54.3447],
  "khalidiya": [24.4663, 54.3447],
  "al bateen": [24.4536, 54.3312],
  "yas island": [24.4959, 54.6056],
  "saadiyat island": [24.5406, 54.4289],
  "saadiyat": [24.5406, 54.4289],
  "al maryah island": [24.4994, 54.3889],
  "masdar city": [24.4269, 54.6144],
  "al mushrif": [24.4400, 54.3900],
  "al wahda": [24.4700, 54.3740],
  "tourist club": [24.4880, 54.3700],
  "al zahiyah": [24.4880, 54.3700],
  "mohammed bin zayed city": [24.3150, 54.5450],
  "mbz city": [24.3150, 54.5450],
  "al shamkha": [24.3300, 54.7100],
  "baniyas": [24.3000, 54.6300],
};

/** Resolve an area name to coordinates, falling back to the city center. */
export function coordsForArea(area: string | undefined | null): [number, number] {
  if (!area) return ABU_DHABI_CENTER;
  const key = area.trim().toLowerCase();
  if (AREA_COORDS[key]) return AREA_COORDS[key];
  // loose contains match (e.g. "a flat in Al Reem Island, Marina Square")
  for (const name of Object.keys(AREA_COORDS)) {
    if (key.includes(name)) return AREA_COORDS[name];
  }
  return ABU_DHABI_CENTER;
}
