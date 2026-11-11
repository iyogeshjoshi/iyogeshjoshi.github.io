import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { site } from '../../catalog';
import { ContactPage, meta } from './ContactPage';

function mockClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
}

describe('ContactPage', () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'clipboard');
    vi.restoreAllMocks();
  });

  it('has the /contact/ path', () => {
    expect(meta.path).toBe('/contact/');
  });

  it('renders the h1, mailto link and key sections', () => {
    render(<ContactPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Get in touch' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: site.email })).toHaveAttribute(
      'href',
      `mailto:${site.email}`
    );
    for (const name of [
      'What to write about',
      'When to expect a reply',
      'Your privacy',
    ]) {
      expect(
        screen.getByRole('heading', { level: 2, name })
      ).toBeInTheDocument();
    }
    expect(screen.getByText(/I read every message/)).toBeInTheDocument();
  });

  it('keeps the copy button hidden without the Clipboard API', () => {
    Reflect.deleteProperty(navigator, 'clipboard');
    render(<ContactPage />);
    expect(screen.queryByRole('button', { name: /copy/i })).toBeNull();
  });

  it('copies the address and announces it politely', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    // userEvent.setup() installs its own clipboard stub, so mock afterwards.
    const user = userEvent.setup();
    mockClipboard(writeText);
    render(<ContactPage />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toBeEmptyDOMElement();

    await user.click(screen.getByRole('button', { name: 'Copy address' }));

    expect(writeText).toHaveBeenCalledWith(site.email);
    expect(status).toHaveTextContent('Email address copied to clipboard.');
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });

  it('announces a failure when copying is rejected', async () => {
    mockClipboard(vi.fn().mockRejectedValue(new Error('denied')));
    render(<ContactPage />);
    await act(async () => {
      screen.getByRole('button', { name: 'Copy address' }).click();
    });
    expect(screen.getByRole('status')).toHaveTextContent(/copy it manually/);
  });

  it('never mentions a non-public app', () => {
    const { container } = render(<ContactPage />);
    expect(container.innerHTML).not.toMatch(/verdict/i);
  });
});
