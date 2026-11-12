import React from 'react';

import { CATEGORY_LABELS, apps, categoriesInUse, site } from '../../catalog';
import { ProsePage, ProseSection } from '../shared';
import type { PageMeta } from '../shared';

export const meta: PageMeta = {
  title: 'About deviloper.dev',
  description:
    'What deviloper.dev is: a collection of free tools, games and simulations built by Yogesh Joshi in his spare time, how they are made and how the site is funded.',
  path: '/about/',
};

const siteHost = new URL(site.url).host;

export const AboutPage: React.FC = () => (
  <ProsePage
    eyebrow="About"
    title={`About ${siteHost}`}
    lead="A small collection of side projects: useful tools, simple games and simulations you can play with, all free and all in your browser."
  >
    <ProseSection id="what-it-is" title="What this is">
      <p>
        {siteHost} is where I put the things I build in my spare time. I&rsquo;m
        Yogesh Joshi, a software engineer, and I like making small, focused apps
        that do one job well. Some are practical, like a ruler you can hold
        objects up against or a counter for checking whether a post fits a
        platform&rsquo;s limit. Others are just for fun or curiosity, like a
        game to fill a short break or a simulation to watch.
      </p>
      <p>
        Each app lives on its own subdomain. This site is the catalog that ties
        them together, with a page for each app explaining what it does and how
        to use it.
      </p>
    </ProseSection>

    <ProseSection id="how-apps-are-built" title="How the apps are built">
      <p>
        The apps are deliberately lightweight. They run in your browser, so
        there is nothing to install and no account to create. Where an app works
        with something you type or measure, that work happens on your device. I
        try to keep each one fast, simple to understand and usable on the
        devices it makes sense for.
      </p>
    </ProseSection>

    <ProseSection id="how-it-is-funded" title="How it's funded">
      <p>
        Everything here is free to use. Ads served by Google AdSense help cover
        the costs and keep it that way. You can read how ads, cookies and your
        consent choices work in the{' '}
        <a href="/privacy-policy.html">privacy policy</a>.
      </p>
    </ProseSection>

    <ProseSection id="new-apps" title="New apps">
      <p>
        The collection grows as I finish things. When a new app launches,
        it&rsquo;s added to the catalog with its own page, so the home page is
        the best place to see what&rsquo;s new.
      </p>
    </ProseSection>

    <ProseSection id="current-apps" title="Current apps">
      {categoriesInUse().map((category) => (
        <React.Fragment key={category}>
          <h3>{CATEGORY_LABELS[category]}</h3>
          <ul>
            {apps
              .filter((app) => app.category === category)
              .map((app) => (
                <li key={app.slug}>
                  <a href={`/apps/${app.slug}/`}>{app.name}</a>: {app.tagline}
                </li>
              ))}
          </ul>
        </React.Fragment>
      ))}
    </ProseSection>

    <ProseSection id="get-in-touch" title="Get in touch">
      <p>
        Feedback, bug reports and ideas are always welcome. Email me at{' '}
        <a href={`mailto:${site.email}`}>{site.email}</a> or see the{' '}
        <a href="/contact/">contact page</a>.
      </p>
    </ProseSection>
  </ProsePage>
);

export default AboutPage;
