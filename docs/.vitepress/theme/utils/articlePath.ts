/** Convert a docs-relative Markdown path or browser route to one stable key. */
export function canonicalArticlePath(value: string): string {
  let path = value.trim().replace(/\\/g, '/');
  path = path.split(/[?#]/, 1)[0];
  path = path.replace(/^docs\//, '').replace(/^\/+/, '');
  path = path.replace(/\.(?:md|html)$/i, '');
  path = path.replace(/(?:^|\/)index$/i, '');
  path = path.replace(/\/+$/g, '');
  return path ? `/${path}`.replace(/\/{2,}/g, '/') : '/';
}
