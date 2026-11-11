import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { site } from '../../catalog';
import { LEGAL_LAST_UPDATED } from '../shared';
import { TermsPage, meta } from './TermsPage';

describe('TermsPage', () => {
  it('has the legacy path', () => {
    expect(meta.path).toBe('/terms.html');
  });

  it('renders the h1 and key sections', () => {
    render(<TermsPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Terms of use' })
    ).toBeInTheDocument();
    for (const name of [
      'Acceptance of these terms',
      'The service',
      'Acceptable use',
      'Intellectual property',
      'Advertising',
      'No warranty',
      'Limitation of liability',
      'Privacy',
      'Governing law',
      'Contact',
    ]) {
      expect(
        screen.getByRole('heading', { level: 2, name })
      ).toBeInTheDocument();
    }
  });

  it('uses LEGAL_LAST_UPDATED and links to the privacy policy and email', () => {
    const { container } = render(<TermsPage />);
    expect(container.querySelector('time')).toHaveAttribute(
      'datetime',
      LEGAL_LAST_UPDATED
    );
    expect(
      screen.getByRole('link', { name: 'privacy policy' })
    ).toHaveAttribute('href', '/privacy-policy.html');
    expect(screen.getByRole('link', { name: site.email })).toHaveAttribute(
      'href',
      `mailto:${site.email}`
    );
  });

  it('does not pick a jurisdiction', () => {
    const { container } = render(<TermsPage />);
    expect(container.textContent).toContain(
      'laws applicable in the operator’s place of residence, without regard to conflict-of-law rules'
    );
  });

  it('never mentions a non-public app', () => {
    const { container } = render(<TermsPage />);
    expect(container.innerHTML).not.toMatch(/verdict/i);
  });
});
