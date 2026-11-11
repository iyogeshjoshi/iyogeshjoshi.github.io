// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AppDetailPage, appDetailPaths } from './AppDetailPage';

describe('AppDetailPage (server render)', () => {
  it('renders every detail path without browser globals', () => {
    expect(typeof window).toBe('undefined');
    const paths = appDetailPaths();
    expect(paths.length).toBeGreaterThan(0);
    for (const path of paths) {
      const slug = path.split('/')[2];
      const html = renderToString(<AppDetailPage slug={slug} />);
      expect(html).toContain('<h1');
      expect(html).toContain('At a glance');
      expect(html).toContain(`view-transition-name:app-${slug}`);
      expect(html.toLowerCase()).not.toContain('verdict');
      expect(renderToString(<AppDetailPage slug={slug} />)).toBe(html);
    }
  });
});
