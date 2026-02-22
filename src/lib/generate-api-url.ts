export function generateAPIUrl(path: string): string {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";
  return `${base}${path}`;
}
