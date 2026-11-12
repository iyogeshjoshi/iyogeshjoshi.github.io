import React from 'react';

import { site } from '../../catalog';
import { LEGAL_LAST_UPDATED, ProsePage, ProseSection } from '../shared';
import type { PageMeta } from '../shared';

export const meta: PageMeta = {
  title: 'Terms of use',
  description:
    'The terms for using deviloper.dev and the free tools, games and simulations in its catalog: acceptable use, ads, intellectual property and disclaimers.',
  path: '/terms.html',
};

const SECTIONS = [
  { id: 'acceptance', label: 'Acceptance of these terms' },
  { id: 'the-service', label: 'The service' },
  { id: 'acceptable-use', label: 'Acceptable use' },
  { id: 'intellectual-property', label: 'Intellectual property' },
  { id: 'advertising', label: 'Advertising' },
  { id: 'no-warranty', label: 'No warranty' },
  { id: 'liability', label: 'Limitation of liability' },
  { id: 'third-party-links', label: 'Third-party links' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'changes', label: 'Changes to these terms' },
  { id: 'governing-law', label: 'Governing law' },
  { id: 'contact', label: 'Contact' },
] as const;

const label = (id: (typeof SECTIONS)[number]['id']): string =>
  SECTIONS.find((s) => s.id === id)?.label ?? id;

const siteHost = new URL(site.url).host;

export const TermsPage: React.FC = () => {
  const email = <a href={`mailto:${site.email}`}>{site.email}</a>;

  return (
    <ProsePage
      eyebrow="Legal"
      title="Terms of use"
      lead={`The ground rules for using ${siteHost} and its apps. They are short and, we hope, unsurprising.`}
      updated={LEGAL_LAST_UPDATED}
      toc={SECTIONS}
    >
      <ProseSection id="acceptance" title={label('acceptance')}>
        <p>
          These terms apply to {siteHost} and to the apps listed in the catalog
          on {siteHost} (together, &ldquo;the service&rdquo;), operated by
          Yogesh Joshi (&ldquo;we&rdquo;, &ldquo;us&rdquo;). By using the
          service you agree to these terms. If you don&rsquo;t agree, please
          don&rsquo;t use it.
        </p>
      </ProseSection>

      <ProseSection id="the-service" title={label('the-service')}>
        <p>
          The service is a collection of free web tools, games and simulations.
          Each app runs in your browser on its own {siteHost} subdomain, and
          none of them requires an account.
        </p>
        <p>
          The apps are side projects. We may change, add or remove features, or
          suspend or discontinue any app or the whole service, at any time and
          without notice. We don&rsquo;t promise that any app will remain
          available.
        </p>
      </ProseSection>

      <ProseSection id="acceptable-use" title={label('acceptable-use')}>
        <p>When using the service, you agree not to:</p>
        <ul>
          <li>use it for anything unlawful, or to help anyone else do so;</li>
          <li>
            attack, overload or disrupt the service or the systems it runs on,
            or try to gain unauthorised access to them;
          </li>
          <li>
            scrape, crawl or make automated requests in a way that harms the
            service&rsquo;s availability or performance;
          </li>
          <li>
            interfere with the ads, including by generating artificial
            impressions or clicks, or encouraging others to do so;
          </li>
          <li>
            misrepresent the service, for example by passing off its apps as
            your own or framing them in a way that suggests a connection that
            doesn&rsquo;t exist.
          </li>
        </ul>
        <p>
          Using an ad blocker or browser privacy settings on your own device is
          not a breach of these terms.
        </p>
      </ProseSection>

      <ProseSection
        id="intellectual-property"
        title={label('intellectual-property')}
      >
        <p>
          Unless stated otherwise, the design, code, text and graphics of the
          service are &copy; Yogesh Joshi. You&rsquo;re welcome to use the apps
          and to link to any page, but you may not copy or republish the
          service&rsquo;s content or code without permission, except where a
          separate licence says otherwise.
        </p>
        <p>
          Names, logos and trademarks of third parties mentioned in the service,
          such as the platforms whose character limits an app shows, belong to
          their owners. Their mention doesn&rsquo;t imply any affiliation or
          endorsement.
        </p>
        <p>
          Conway&rsquo;s Game of Life is a mathematical concept devised by John
          Conway and is not owned by anyone. Our implementation of it is covered
          by the paragraph above, like the rest of the service.
        </p>
        <p>
          Anything you create or enter in an app, such as text or patterns, is
          yours; it stays in your browser and we don&rsquo;t claim any rights to
          it.
        </p>
      </ProseSection>

      <ProseSection id="advertising" title={label('advertising')}>
        <p>
          The service is free because it shows ads, which are provided by
          Google. We don&rsquo;t choose individual ads and don&rsquo;t endorse
          the advertisers or their products. Any dealings you have with an
          advertiser are between you and the advertiser.
        </p>
      </ProseSection>

      <ProseSection id="no-warranty" title={label('no-warranty')}>
        <p>
          The service is provided &ldquo;as is&rdquo; and &ldquo;as
          available&rdquo;, without warranties of any kind, whether express or
          implied, including warranties of accuracy, fitness for a particular
          purpose and non-infringement, to the extent permitted by law.
        </p>
        <p>
          Results produced by the apps are approximate. On-screen measurements
          depend on your display and calibration, and character counts may
          differ from how a particular platform counts characters. Always verify
          results before relying on them for anything important, such as
          manufacturing, legal, medical or financial purposes.
        </p>
      </ProseSection>

      <ProseSection id="liability" title={label('liability')}>
        <p>
          To the extent permitted by law, we are not liable for any indirect,
          incidental, special or consequential loss or damage, or for any loss
          of data, profits or opportunity, arising from your use of, or
          inability to use, the service. Nothing in these terms limits any
          liability that cannot be limited or excluded under applicable law.
        </p>
      </ProseSection>

      <ProseSection id="third-party-links" title={label('third-party-links')}>
        <p>
          The service links to websites we don&rsquo;t operate, including
          advertisers&rsquo; websites. We are not responsible for their content,
          availability or practices, and a link doesn&rsquo;t mean we endorse
          them.
        </p>
      </ProseSection>

      <ProseSection id="privacy" title={label('privacy')}>
        <p>
          Our <a href="/privacy-policy.html">privacy policy</a> explains what
          information is collected when you use the service, how cookies are
          used and the choices you have.
        </p>
      </ProseSection>

      <ProseSection id="changes" title={label('changes')}>
        <p>
          We may update these terms from time to time. When we do, we will
          change the &ldquo;Last updated&rdquo; date at the top of this page. If
          you keep using the service after an update, the updated terms apply.
        </p>
      </ProseSection>

      <ProseSection id="governing-law" title={label('governing-law')}>
        <p>
          These terms are governed by the laws applicable in the
          operator&rsquo;s place of residence, without regard to conflict-of-law
          rules. This doesn&rsquo;t take away any protection you have under the
          mandatory consumer laws of the country where you live.
        </p>
      </ProseSection>

      <ProseSection id="contact" title={label('contact')}>
        <p>Questions about these terms? Email {email}.</p>
      </ProseSection>
    </ProsePage>
  );
};

export default TermsPage;
