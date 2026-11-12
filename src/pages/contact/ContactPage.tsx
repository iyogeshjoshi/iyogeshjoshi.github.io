import React from 'react';

import { site } from '../../catalog';
import { ProsePage, ProseSection } from '../shared';
import type { PageMeta } from '../shared';
import { CopyEmailButton } from './CopyEmailButton';
import styles from './ContactPage.module.css';

export const meta: PageMeta = {
  title: 'Contact',
  description:
    'Get in touch about deviloper.dev and its apps: feedback, bug reports, ideas for new tools or privacy requests. Email only, and every message is read.',
  path: '/contact/',
};

export const ContactPage: React.FC = () => (
  <ProsePage
    eyebrow="Contact"
    title="Get in touch"
    lead="The best way to reach me is by email. There's no contact form, so your message goes straight to my inbox."
  >
    <div className={styles.card}>
      <p className={styles.cardLabel}>Email</p>
      <div className={styles.row}>
        <a className={styles.email} href={`mailto:${site.email}`}>
          {site.email}
        </a>
        <CopyEmailButton email={site.email} />
      </div>
    </div>

    <ProseSection id="what-to-write-about" title="What to write about">
      <ul>
        <li>
          <strong>Feedback</strong>: what you like, what&rsquo;s confusing or
          what could work better.
        </li>
        <li>
          <strong>Bugs</strong>: tell me which app, what you did, what you
          expected and what happened instead. Your browser and device help too.
        </li>
        <li>
          <strong>Ideas</strong>: features for an existing app, or a small tool,
          game or simulation you&rsquo;d like to see.
        </li>
        <li>
          <strong>Privacy requests</strong>: questions about your data or
          requests to exercise your rights, as described in the{' '}
          <a href="/privacy-policy.html">privacy policy</a>.
        </li>
      </ul>
    </ProseSection>

    <ProseSection id="response-time" title="When to expect a reply">
      <p>
        I read every message. This is a side project, so replies may take a few
        days.
      </p>
    </ProseSection>

    <ProseSection id="your-privacy" title="Your privacy">
      <p>
        Your email address and message are used only to reply to you. They
        aren&rsquo;t shared with anyone or added to a mailing list. See the{' '}
        <a href="/privacy-policy.html">privacy policy</a> for details.
      </p>
    </ProseSection>
  </ProsePage>
);

export default ContactPage;
