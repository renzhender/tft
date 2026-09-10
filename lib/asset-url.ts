declare const __PAGES_BASE__: string | undefined;

// The Sites build serves assets at /; Pages may serve this app below /tft/.
export function assetUrl(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  const base = typeof __PAGES_BASE__ === 'string' ? __PAGES_BASE__ : '/';
  return `${base.replace(/\/$/, '')}${path}`;
}
