import React from 'react';

import { apps, site } from '../../catalog';
import {
  LEGAL_LAST_UPDATED,
  ProsePage,
  ProseSection,
  SummaryBox,
} from '../shared';
import type { PageMeta } from '../shared';

export const meta: PageMeta = {
  title: 'Privacy policy',
  description:
    'How deviloper.dev and the apps in its catalog handle data: browser-only tools, Google AdSense and Analytics, cookies, consent choices and your rights.',
  path: '/privacy-policy.html',
};

const SECTIONS = [
  { id: 'who-we-are', label: 'Who we are and what this covers' },
  {
    id: 'collected-automatically',
    label: 'Information collected automatically',
  },
  { id: 'information-you-provide', label: 'Information you provide' },
  { id: 'cookies', label: 'Cookies and local storage' },
  { id: 'consent', label: 'Consent' },
  { id: 'adsense', label: 'Google AdSense' },
  { id: 'analytics', label: 'Google Analytics 4' },
  { id: 'third-party-links', label: 'Third-party links' },
  { id: 'retention', label: 'Data retention' },
  { id: 'children', label: "Children's privacy" },
  { id: 'your-rights', label: 'Your rights' },
  { id: 'transfers', label: 'International transfers' },
  { id: 'changes', label: 'Changes to this policy' },
  { id: 'contact', label: 'Contact' },
] as const;

const label = (id: (typeof SECTIONS)[number]['id']): string =>
  SECTIONS.find((s) => s.id === id)?.label ?? id;

const hostOf = (url: string): string => new URL(url).host;

const siteHost = hostOf(site.url);

export const PrivacyPolicyPage: React.FC = () => {
  const mailto = `mailto:${site.email}`;
  const email = <a href={mailto}>{site.email}</a>;

  return (
    <ProsePage
      eyebrow="Legal"
      title="Privacy policy"
      lead={`How ${siteHost} and the apps in its catalog handle information about you.`}
      updated={LEGAL_LAST_UPDATED}
      toc={SECTIONS}
    >
      <SummaryBox title="The short version">
        <ul>
          <li>
            There are no accounts. The apps run in your browser, and what you
            type, draw or measure in them stays on your device.
          </li>
          <li>
            We don't run a database of visitors and don't ask for your name or
            other personal details.
          </li>
          <li>
            {siteHost} and some apps show ads from Google AdSense and measure
            visits with Google Analytics 4. These services may use cookies.
            Where the law requires it, we ask for your consent first, and you
            can change your choice at any time with the &ldquo;Cookie
            settings&rdquo; link in the footer.
          </li>
          <li>If you email us, your address is used only to reply to you.</li>
        </ul>
      </SummaryBox>

      <ProseSection id="who-we-are" title={label('who-we-are')}>
        <p>
          {siteHost} is a collection of free web tools, games and simulations
          built and operated by Yogesh Joshi (&ldquo;we&rdquo;,
          &ldquo;us&rdquo;). You can reach us at {email}. The apps are free to
          use and do not require registration or a login.
        </p>
        <p>
          This policy applies to {siteHost} and to the apps listed in the
          catalog on {siteHost}, each of which runs on its own subdomain:
        </p>
        <ul>
          {apps.map((app) => (
            <li key={app.slug}>
              <a href={app.url}>{app.name}</a> ({hostOf(app.url)})
            </li>
          ))}
        </ul>
        <p>
          Not every app uses every service described below. Where an app uses
          one of them, it uses it in the way this policy describes.
        </p>
      </ProseSection>

      <ProseSection
        id="collected-automatically"
        title={label('collected-automatically')}
      >
        <h3>Analytics</h3>
        <p>
          {siteHost} and some apps use Google Analytics 4 to understand how
          visitors use them. Subject to your consent choices, it may collect:
        </p>
        <ul>
          <li>pages visited and time spent on them;</li>
          <li>the referring website or link;</li>
          <li>browser type and version, operating system and device type;</li>
          <li>
            approximate location, such as country and region, derived from your
            IP address;
          </li>
          <li>
            interactions with the site, such as opening an app, searching the
            catalog or changing the theme.
          </li>
        </ul>
        <p>
          See <a href="#analytics">Google Analytics 4</a> below for details and
          how to opt out. Some apps may instead, or also, use privacy-friendly,
          cookieless analytics provided by their host, which count visits
          without setting cookies.
        </p>

        <h3>Hosting and server logs</h3>
        <p>
          {siteHost} is served by GitHub Pages. Some apps are hosted on other
          static hosting services, such as Cloudflare Pages. As with any
          website, these hosts receive technical information when your browser
          requests a page, including your IP address, the page requested, the
          date and time, and your browser&rsquo;s user agent, and they may keep
          this information in logs for security and operational purposes. Their
          handling of this data is described in the{' '}
          <a href="https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement">
            GitHub General Privacy Statement
          </a>{' '}
          and the{' '}
          <a href="https://www.cloudflare.com/privacypolicy/">
            Cloudflare Privacy Policy
          </a>
          . We do not use these logs to identify visitors.
        </p>
      </ProseSection>

      <ProseSection
        id="information-you-provide"
        title={label('information-you-provide')}
      >
        <h3>What you enter into the apps</h3>
        <p>
          The apps run in your browser. They have no sign-up, and the text,
          measurements, drawings and other input you give them are processed on
          your device. Here is what each app says about its own data:
        </p>
        <ul>
          {apps.map((app) => (
            <li key={app.slug}>
              <strong>{app.name}:</strong> {app.privacy}
            </li>
          ))}
        </ul>
        <p>
          Searching or filtering the catalog on {siteHost} also happens in your
          browser. If you have allowed analytics, the fact that you searched,
          and the search term, may be recorded as an analytics event.
        </p>

        <h3>When you email us</h3>
        <p>
          If you write to {email}, we receive your email address, your message
          and anything you choose to include. We use this only to read and reply
          to your message, and we do not share it with third parties or add you
          to a mailing list.
        </p>
      </ProseSection>

      <ProseSection id="cookies" title={label('cookies')}>
        <p>
          Cookies and local storage are small pieces of data a website keeps in
          your browser. The following may be stored:
        </p>
        <ul>
          <li>
            <strong>Theme preference</strong> on {siteHost}: your light, dark or
            automatic theme choice is saved in local storage under the key{' '}
            <code>theme</code>. It never leaves your device.
          </li>
          <li>
            <strong>App settings</strong>: individual apps may save settings in
            your browser&rsquo;s local storage so you don&rsquo;t have to set
            them again, for example a ruler&rsquo;s screen calibration. These
            stay on your device.
          </li>
          <li>
            <strong>Consent choices</strong>: Google&rsquo;s consent message
            stores a record of the choices you make on your device so that it
            doesn&rsquo;t ask again on every visit.
          </li>
          <li>
            <strong>Google Analytics cookies</strong>: used to tell visits and
            visitors apart for usage measurement. Set only in line with your
            consent choices.
          </li>
          <li>
            <strong>Google AdSense cookies</strong>: used by Google and its
            partners to serve and measure ads and, where you allow it, to
            personalise them. Set only in line with your consent choices.
          </li>
        </ul>
        <p>
          You can delete cookies and local storage at any time in your
          browser&rsquo;s settings. Doing so resets your theme, app settings and
          consent choices.
        </p>
      </ProseSection>

      <ProseSection id="consent" title={label('consent')}>
        <p>
          We use Google&rsquo;s Privacy &amp; messaging, a Google-certified
          consent management platform, to ask for your choices about cookies and
          data use:
        </p>
        <ul>
          <li>
            Visitors in the European Economic Area (EEA), the United Kingdom and
            Switzerland are shown a consent message before advertising and
            analytics cookies are used.
          </li>
          <li>
            Where applicable, visitors in US states with consumer privacy laws
            are shown a US state privacy message that lets them opt out of the
            sale or sharing of their personal information for targeted
            advertising.
          </li>
        </ul>
        <p>
          We use Google Consent Mode v2. On {siteHost}, the consent signals for
          ad storage, ad user data, ad personalisation and analytics storage
          default to &ldquo;denied&rdquo; before Google&rsquo;s tags load, and
          your choices in the consent message update them. When a signal is
          denied, Google&rsquo;s tags don&rsquo;t use cookies for that purpose,
          but they may still send limited, cookieless requests, for example to
          count a page view or to serve non-personalised ads.
        </p>
        <p>
          <strong>Changing your choices:</strong> use the &ldquo;Cookie
          settings&rdquo; link in the footer of {siteHost} to reopen the consent
          message at any time. If the message doesn&rsquo;t appear (for example
          because it isn&rsquo;t shown in your region, or a content blocker
          prevents it from loading), you can clear cookies for the site in your
          browser settings instead.
        </p>
      </ProseSection>

      <ProseSection id="adsense" title={label('adsense')}>
        <p>
          {siteHost} and some apps use Google AdSense to show advertisements,
          which keeps everything free to use. Ads are placed automatically by
          Google (AdSense Auto ads).
        </p>
        <p>
          Depending on your location and consent choices, Google may show
          personalised ads, which are based on interests inferred from your
          activity on this and other websites, or non-personalised ads, which
          are based on context such as the content of the page and your general
          location.
        </p>
        <p>
          Third-party vendors, including Google, use cookies to serve ads based
          on your prior visits to this website or other websites. Google&rsquo;s
          use of advertising cookies enables it and its partners to serve ads to
          you based on your visits to this site and/or other sites on the
          internet.
        </p>
        <p>You can opt out of personalised advertising:</p>
        <ul>
          <li>
            from Google, in{' '}
            <a href="https://www.google.com/settings/ads">
              Google Ads Settings
            </a>
            ;
          </li>
          <li>
            from participating third-party vendors, at{' '}
            <a href="https://www.aboutads.info/choices/">www.aboutads.info</a>.
          </li>
        </ul>
        <p>
          For more information, see{' '}
          <a href="https://policies.google.com/technologies/partner-sites">
            How Google uses information from sites or apps that use its services
          </a>{' '}
          and{' '}
          <a href="https://policies.google.com/technologies/ads">
            How Google uses cookies in advertising
          </a>
          .
        </p>
      </ProseSection>

      <ProseSection id="analytics" title={label('analytics')}>
        <p>
          We use Google Analytics 4 to understand how visitors use {siteHost}{' '}
          and some apps: which pages and apps are popular, how long visits last,
          where visitors come from and which devices they use. We look at this
          information in aggregate to decide what to build and fix; we
          don&rsquo;t use it to identify you.
        </p>
        <p>
          According to Google, Google Analytics 4 does not log or store IP
          addresses. It uses them to derive approximate location, such as
          country or city, and then discards them.
        </p>
        <p>
          Google Analytics respects the consent choices described above. You can
          also opt out of Google Analytics on all websites with the{' '}
          <a href="https://tools.google.com/dlpage/gaoptout">
            Google Analytics opt-out browser add-on
          </a>
          . Google&rsquo;s handling of this data is described in the{' '}
          <a href="https://policies.google.com/privacy">
            Google Privacy Policy
          </a>
          .
        </p>
      </ProseSection>

      <ProseSection id="third-party-links" title={label('third-party-links')}>
        <p>
          {siteHost} links to its apps and to other websites, such as the Google
          pages referenced in this policy, and ads may link to
          advertisers&rsquo; websites. We are not responsible for the privacy
          practices of websites we don&rsquo;t operate. Please read their
          privacy policies before giving them any personal information.
        </p>
      </ProseSection>

      <ProseSection id="retention" title={label('retention')}>
        <ul>
          <li>
            We don&rsquo;t operate a database and don&rsquo;t keep personal data
            on servers of our own.
          </li>
          <li>
            Analytics data in Google Analytics is kept for up to 14 months under
            Google Analytics&rsquo; data retention settings, and then deleted by
            Google.
          </li>
          <li>
            Advertising data is kept by Google according to the{' '}
            <a href="https://policies.google.com/privacy">
              Google Privacy Policy
            </a>
            .
          </li>
          <li>
            Hosting logs are kept by the hosting providers under their own
            policies.
          </li>
          <li>
            Emails are kept only as long as needed to deal with your message,
            and then deleted.
          </li>
          <li>Data saved in your browser stays there until you clear it.</li>
        </ul>
      </ProseSection>

      <ProseSection id="children" title={label('children')}>
        <p>
          {siteHost} and its apps are not directed at children under 13, or at
          children under 16 in the EEA without the consent of a parent or
          guardian, and we do not knowingly collect personal information from
          them. If you believe a child has sent us personal information, please
          contact {email} and we will delete it.
        </p>
      </ProseSection>

      <ProseSection id="your-rights" title={label('your-rights')}>
        <p>
          Depending on where you live, you may have rights over your personal
          information. Under the EU General Data Protection Regulation (GDPR)
          and the UK GDPR, these include the right to:
        </p>
        <ul>
          <li>access the personal data we hold about you;</li>
          <li>have it corrected or deleted;</li>
          <li>object to or restrict how it is processed;</li>
          <li>receive it in a portable format;</li>
          <li>
            withdraw your consent at any time, without affecting processing that
            took place before you withdrew it;
          </li>
          <li>complain to your local data protection authority.</li>
        </ul>
        <p>
          Where these laws apply, we rely on your consent for advertising and
          analytics cookies, and on our legitimate interest in running and
          securing the site and in replying to messages for hosting logs and
          email.
        </p>
        <p>
          If you are a California resident, the California Consumer Privacy Act
          as amended by the CPRA gives you rights to know, delete and correct
          personal information and to opt out of its &ldquo;sale&rdquo; or
          &ldquo;sharing&rdquo;. Showing personalised ads may count as sharing
          under that law. You can opt out through the US state privacy message
          described under <a href="#consent">Consent</a>, reopened with the
          &ldquo;Cookie settings&rdquo; link in the footer. Residents of other
          US states with similar laws can use the same message.
        </p>
        <p>
          Because we don&rsquo;t hold accounts or a visitor database, most data
          about your visits is held by Google and the hosting providers, and you
          can manage much of it directly through the links in this policy. For
          anything else, email {email}. We aim to respond within one month.
        </p>
      </ProseSection>

      <ProseSection id="transfers" title={label('transfers')}>
        <p>
          Google, GitHub and Cloudflare process data in the United States and
          other countries, which may have different data protection laws from
          those where you live. These providers describe the safeguards they use
          for international transfers in their own privacy policies.
        </p>
      </ProseSection>

      <ProseSection id="changes" title={label('changes')}>
        <p>
          We may update this policy from time to time, for example when an app
          is added to the catalog or a service changes. When we do, we will
          change the &ldquo;Last updated&rdquo; date at the top of this page.
          Please check back occasionally.
        </p>
      </ProseSection>

      <ProseSection id="contact" title={label('contact')}>
        <p>
          If you have questions about this policy or how your data is handled,
          or want to exercise your rights, contact Yogesh Joshi at {email}.
        </p>
      </ProseSection>
    </ProsePage>
  );
};

export default PrivacyPolicyPage;
