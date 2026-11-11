import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Header } from './Header';

describe('Header', () => {
  it('renders the home link and primary nav links', () => {
    render(<Header />);
    expect(
      screen.getByRole('link', { name: 'deviloper.dev home' })
    ).toHaveAttribute('href', '/');
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(nav.querySelector('a[href="/"]')).toHaveTextContent('Catalog');
    expect(nav.querySelector('a[href="/about/"]')).toHaveTextContent('About');
    expect(nav.querySelector('a[href="/contact/"]')).toHaveTextContent(
      'Contact'
    );
  });

  it('sets aria-current on the current page only', () => {
    render(<Header currentPath="/about/" />);
    expect(
      screen.getByRole('link', { name: 'About', hidden: true })
    ).toHaveAttribute('aria-current', 'page');
    expect(
      screen.getByRole('link', { name: 'Catalog', hidden: true })
    ).not.toHaveAttribute('aria-current');
  });

  it('toggles the mobile menu and wires aria-controls', async () => {
    const user = userEvent.setup();
    render(<Header />);
    const button = screen.getByRole('button', { name: /menu/i });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(
      document.getElementById(button.getAttribute('aria-controls') ?? '')
    ).not.toBeNull();
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on Escape and restores focus to the button', async () => {
    const user = userEvent.setup();
    render(<Header />);
    const button = screen.getByRole('button', { name: /menu/i });
    await user.click(button);
    screen.getByRole('link', { name: 'About', hidden: true }).focus();
    await user.keyboard('{Escape}');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveFocus();
  });

  it('closes on outside click', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Header />
        <p>outside</p>
      </div>
    );
    const button = screen.getByRole('button', { name: /menu/i });
    await user.click(button);
    await user.click(screen.getByText('outside'));
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});
