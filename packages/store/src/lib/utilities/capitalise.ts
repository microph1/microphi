export function capitalise(s: string) {
  if (!s) { return ''; }

  return s[0].toUpperCase() + s.slice(1);
}
