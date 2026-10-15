const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function appPath(path: string) {
  if (!path.startsWith("/")) {
    throw new Error(`Application paths must start with "/": ${path}`);
  }

  if (!basePath || path === basePath || path.startsWith(`${basePath}/`)) {
    return path;
  }

  return `${basePath}${path}`;
}
