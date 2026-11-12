import { parse as parseYaml } from 'yaml';
import type { ZodIssue } from 'zod';
import { catalogSchema, isPublicStatus, PUBLIC_STATUSES } from './schema';
import type { Catalog, PublicApp, PublicCatalog } from './schema';

/**
 * Node-safe, pure catalog loading. Used by the Vite plugin at build time and by tests.
 * Never import this from client code: it pulls in `yaml` and `zod`.
 */

export { PUBLIC_STATUSES };

/** Formats a zod issue path as `apps[2].description`. */
export function formatIssuePath(path: ReadonlyArray<string | number>): string {
  if (path.length === 0) return '(root)';
  return path
    .map((segment, index) =>
      typeof segment === 'number'
        ? `[${segment}]`
        : index === 0
          ? segment
          : `.${segment}`
    )
    .join('');
}

function formatIssue(issue: ZodIssue): string {
  return `${formatIssuePath(issue.path)}: ${issue.message}`;
}

/**
 * Parses and validates catalog YAML.
 * @throws Error listing every validation issue with its path, one per line.
 */
export function parseCatalog(yamlText: string): Catalog {
  let raw: unknown;
  try {
    raw = parseYaml(yamlText);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid catalog YAML: ${detail}`);
  }

  const result = catalogSchema.safeParse(raw);
  if (!result.success) {
    const lines = result.error.issues.map(
      (issue) => `  - ${formatIssue(issue)}`
    );
    throw new Error(
      `Invalid catalog (${result.error.issues.length} issue${result.error.issues.length === 1 ? '' : 's'}):\n${lines.join('\n')}`
    );
  }
  return result.data;
}

/** Keeps only apps whose status may ship publicly (live, beta, coming-soon). */
export function toPublicCatalog(catalog: Catalog): PublicCatalog {
  const apps = catalog.apps.filter((app): app is PublicApp =>
    isPublicStatus(app.status)
  );
  return { site: catalog.site, apps };
}
