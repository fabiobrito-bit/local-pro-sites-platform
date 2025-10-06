// In-memory JWT blacklist (for demo/dev only)
const blacklist = new Set<string>();

export function blacklistToken(token: string) {
  blacklist.add(token);
}

export function isTokenBlacklisted(token: string): boolean {
  return blacklist.has(token);
}
