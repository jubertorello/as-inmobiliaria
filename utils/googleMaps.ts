function isFiniteNumber(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

export function googleMapsSearchUrl(query: string): string {
  const q = (query || '').trim();
  if (!q) return '#';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export function googleMapsUrlFromCoordsOrQuery(opts: {
  query?: string;
  latitude?: number | null;
  longitude?: number | null;
}): string {
  const q = (opts.query || '').trim();
  const lat = opts.latitude;
  const lng = opts.longitude;

  // Prefer showing the address text in Google Maps UI.
  // If we have coords + an address, we open Maps searching by address (so it shows the address),
  // but we also center the map near the provided coordinates.
  if (q && isFiniteNumber(lat) && isFiniteNumber(lng)) {
    return `https://www.google.com/maps?q=${encodeURIComponent(q)}&ll=${encodeURIComponent(`${lat},${lng}`)}&z=17`;
  }

  // If we only have coordinates, open the exact point.
  if (isFiniteNumber(lat) && isFiniteNumber(lng)) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
  }

  return googleMapsSearchUrl(q);
}