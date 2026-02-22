import Constants from "expo-constants";

export function generateAPIUrl(path: string): string {
  const envBase = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";
  if (envBase) return `${envBase.replace(/\/$/, "")}${path}`;

  // On physical device, relative URLs can fail — use dev server host from manifest
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.manifest?.debuggerHost;
  if (hostUri) {
    const base = hostUri.replace(/^exp:\/\//, "http://");
    const url = base.startsWith("http") ? base : `http://${base}`;
    return `${url.replace(/\/$/, "")}${path}`;
  }

  return path;
}
