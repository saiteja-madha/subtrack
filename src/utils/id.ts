export function newId(prefix = ""): string {
  const s = Math.random().toString(36).slice(2, 10);
  const t = Date.now().toString(36);
  return prefix ? `${prefix}-${t}-${s}` : `${t}-${s}`;
}
