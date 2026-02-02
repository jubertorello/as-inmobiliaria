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
  const { query, latitude, longitude } = opts;

  if (isFiniteNumber(latitude) && isFiniteNumber(longitude)) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`;
  }

  return googleMapsSearchUrl(query || '');
}