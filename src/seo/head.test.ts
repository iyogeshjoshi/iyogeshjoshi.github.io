import { describe, expect, it } from 'vitest';

import { escapeHtml, renderHead, serializeJsonLd } from './head';

describe('head helpers', () => {
  it('escapes attribute values', () => {
    expect(escapeHtml(`a"b'<c>&`)).toBe('a&quot;b&#39;&lt;c&gt;&amp;');
    const head = renderHead({
      title: 'A "quoted" <title>',
      description: 'x & y',
      path: '/',
    });
    expect(head).toContain('<title>A &quot;quoted&quot; &lt;title&gt;</title>');
    expect(head).toContain('content="x &amp; y"');
  });

  it('JSON-LD cannot break out of its script tag', () => {
    const out = serializeJsonLd({
      name: '</script><script>alert(1)</script> ',
    });
    expect(out).not.toContain('<');
    expect(out).not.toContain(' ');
    expect(JSON.parse(out)).toEqual({
      name: '</script><script>alert(1)</script> ',
    });
  });

  it('uses summary_large_image only with a preview image', () => {
    expect(renderHead({ title: 't', description: 'd', path: '/' })).toContain(
      'content="summary"'
    );
    const withImage = renderHead({
      title: 't',
      description: 'd',
      path: '/a/',
      ogImage: '/p.png',
    });
    expect(withImage).toContain('content="summary_large_image"');
    expect(withImage).toContain('content="https://deviloper.dev/p.png"');
  });
});
