import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { apps, site } from '../../catalog';
import { LEGAL_LAST_UPDATED, formatIsoDate } from '../shared';
import { PrivacyPolicyPage, meta } from './PrivacyPolicyPage';

const OPT_OUT_LINKS = [
  'https://www.google.com/settings/ads',
  'https://www.aboutads.info/choices/',
  'https://policies.google.com/technologies/partner-sites',
  'https://policies.google.com/technologies/ads',
  'https://tools.google.com/dlpage/gaoptout',
];

const SECTION_HEADINGS = [
  'Who we are and what this covers',
  'Information collected automatically',
  'Information you provide',
  'Cookies and local storage',
  'Consent',
  'Google AdSense',
  'Google Analytics 4',
  'Third-party links',
  'Data retention',
  "Children's privacy",
  'Your rights',
  'International transfers',
  'Changes to this policy',
  'Contact',
];

describe('PrivacyPolicyPage', () => {
  it('has the legacy path', () => {
    expect(meta.path).toBe('/privacy-policy.html');
  });

  it('renders the h1, summary and every section', () => {
    render(<PrivacyPolicyPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Privacy policy' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('complementary', { name: 'The short version' })
    ).toBeInTheDocument();
    for (const name of SECTION_HEADINGS) {
      expect(
        screen.getByRole('heading', { level: 2, name })
      ).toBeInTheDocument();
    }
  });

  it('uses LEGAL_LAST_UPDATED', () => {
    const { container } = render(<PrivacyPolicyPage />);
    const time = container.querySelector('time');
    expect(time).toHaveAttribute('datetime', LEGAL_LAST_UPDATED);
    expect(time).toHaveTextContent(formatIsoDate(LEGAL_LAST_UPDATED));
  });

  it('lists every public app with a link and its privacy note', () => {
    const { container } = render(<PrivacyPolicyPage />);
    const scope = screen.getByRole('region', {
      name: 'Who we are and what this covers',
    });
    for (const app of apps) {
      expect(
        within(scope).getByRole('link', { name: app.name })
      ).toHaveAttribute('href', app.url);
      expect(container.textContent).toContain(app.privacy);
    }
  });

  it('contains the Google opt-out and policy links', () => {
    const { container } = render(<PrivacyPolicyPage />);
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) =>
      a.getAttribute('href')
    );
    for (const href of OPT_OUT_LINKS) expect(hrefs).toContain(href);
  });

  it('describes consent, local storage and contact', () => {
    const { container } = render(<PrivacyPolicyPage />);
    const text = container.textContent ?? '';
    expect(text).toMatch(/Consent Mode v2/);
    expect(text).toMatch(/Cookie settings/);
    expect(text).toMatch(/EEA/);
    expect(container.querySelector('code')).toHaveTextContent('theme');
    expect(
      container.querySelector(`a[href="mailto:${site.email}"]`)
    ).not.toBeNull();
    expect(text).not.toMatch(/github api/i);
  });

  it('never mentions a non-public app', () => {
    const { container } = render(<PrivacyPolicyPage />);
    expect(container.innerHTML).not.toMatch(/verdict/i);
  });
});
