export function savePolygons(data: { buffer: string[]; workspace: string[] }) {
  localStorage.setItem('polygonData', JSON.stringify(data));
}

export function loadPolygons(): { buffer: string[]; workspace: string[] } {
  return JSON.parse(
    localStorage.getItem('polygonData') || '{"buffer":[],"workspace":[]}'
  );
}

export function clearPolygons() {
  localStorage.removeItem('polygonData');
}
