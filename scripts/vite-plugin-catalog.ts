import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import { parseCatalog, toPublicCatalog } from '../src/catalog/load';

export const VIRTUAL_CATALOG_ID = 'virtual:catalog';
const RESOLVED_VIRTUAL_CATALOG_ID = `\0${VIRTUAL_CATALOG_ID}`;

export const DEFAULT_CATALOG_FILE = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../src/data/catalog.yaml'
);

export interface CatalogPluginOptions {
  /** Absolute path to the catalog YAML. Defaults to `src/data/catalog.yaml`. */
  file?: string;
}

/**
 * Validates catalog YAML and renders the `virtual:catalog` module source.
 * Only public entries (live, beta, coming-soon) are serialised, so draft and
 * private apps can never reach the client bundle.
 */
export function renderCatalogModule(yamlText: string): string {
  const publicCatalog = toPublicCatalog(parseCatalog(yamlText));
  return `export default ${JSON.stringify(publicCatalog)};\n`;
}

/** Provides `virtual:catalog`: the validated, public-only catalog as JSON. */
export function catalogPlugin(options: CatalogPluginOptions = {}): Plugin {
  const file = options.file ?? DEFAULT_CATALOG_FILE;

  return {
    name: 'deviloper:catalog',
    resolveId(id) {
      return id === VIRTUAL_CATALOG_ID ? RESOLVED_VIRTUAL_CATALOG_ID : null;
    },
    load(id) {
      if (id !== RESOLVED_VIRTUAL_CATALOG_ID) return null;
      this.addWatchFile(file);

      let yamlText: string;
      try {
        yamlText = readFileSync(file, 'utf8');
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        this.error(`Could not read catalog file ${file}: ${detail}`);
      }

      try {
        return renderCatalogModule(yamlText);
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        this.error(`${file}\n${detail}`);
      }
    },
  };
}
