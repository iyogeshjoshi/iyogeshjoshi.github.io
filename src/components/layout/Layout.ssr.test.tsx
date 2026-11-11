// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';

import { Layout } from './Layout';

describe('Layout SSR', () => {
  it('renders to a string without touching browser globals', () => {
    const html = renderToString(
      <Layout>
        <p>x</p>
      </Layout>
    );
    expect(html).toContain('<main');
    expect(html).toContain('hello@deviloper.dev');
  });
});
