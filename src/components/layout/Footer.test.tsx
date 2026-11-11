import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { apps } from '../../catalog';
import { Footer } from './Footer';

describe('Footer', () => {
  afterEach(() => {
    delete window.googlefc;
  });

  it('shows the contact email as a mailto link', () => {
    render(<Footer />);
    expect(
      screen.getByRole('link', { name: 'hello@deviloper.dev' })
    ).toHaveAttribute('href', 'mailto:hello@deviloper.dev');
  });

  it('has no social links', () => {
    const { container } = render(<Footer />);
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) =>
      a.getAttribute('href')
    );
    expect(
      hrefs.some((h) => /github|linkedin|x\.com|twitter/i.test(h ?? ''))
    ).toBe(false);
  });

  it('lists every public app and the legal links', () => {
    render(<Footer />);
    for (const app of apps) {
      expect(screen.getByRole('link', { name: app.name })).toHaveAttribute(
        'href',
        `/apps/${app.slug}/`
      );
    }
    expect(
      screen.getByRole('link', { name: 'Privacy policy' })
    ).toHaveAttribute('href', '/privacy-policy.html');
    expect(screen.getByRole('link', { name: 'Terms of use' })).toHaveAttribute(
      'href',
      '/terms.html'
    );
    expect(screen.getByRole('link', { name: 'Sitemap' })).toHaveAttribute(
      'href',
      '/sitemap.html'
    );
  });

  it('Cookie settings calls googlefc when present', async () => {
    const show = vi.fn();
    const queue: Array<() => void> = [];
    window.googlefc = { callbackQueue: queue, showRevocationMessage: show };
    render(<Footer />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Cookie settings' })
    );
    expect(queue).toEqual([show]);
  });

  it('Cookie settings is harmless without googlefc', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<Footer />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Cookie settings' })
    );
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
