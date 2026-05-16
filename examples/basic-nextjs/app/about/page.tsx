import { defineSeo } from '@answerable/metadata';
import { organization } from '@answerable/schemas';

export const metadata = defineSeo({
  title: 'About Basic Next.js Example',
  description: 'Learn about Basic Next.js Example, the team behind example.com.',
  url: 'https://example.com/about',
});

const orgSchema = organization({
  name: 'Basic Next.js Example',
  url: 'https://example.com',
  description: 'The minimal example of an Answerable-powered Next.js site.',
});

export default function AboutPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: required for JSON-LD injection
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <h1>About Basic Next.js Example</h1>
      <p>The minimal example of an Answerable-powered Next.js site.</p>

      <h2>Who we are</h2>
      <p>
        Edit this section to introduce the team behind Basic Next.js Example — who you are, where
        you&apos;re based, and why you started.
      </p>

      <h2>What we believe</h2>
      <p>
        Edit this section to spell out your principles: how you approach the problem, what you
        refuse to do, what we promise users.
      </p>

      <h2>Get in touch</h2>
      <p>
        Reach the Basic Next.js Example team via the{' '}
        <a href="https://example.com/contact">contact page</a>.
      </p>
    </main>
  );
}
