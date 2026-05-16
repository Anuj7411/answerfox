import { defineSeo } from '@answerable/metadata';

export const metadata = defineSeo({
  title: 'Contact — Basic Next.js Example',
  description: 'How to reach the Basic Next.js Example team.',
  url: 'https://example.com/contact',
});

export default function ContactPage() {
  return (
    <main>
      <h1>Contact Basic Next.js Example</h1>
      <p>
        The fastest way to reach us is by email at{' '}
        <a href="mailto:hello@example.com">hello@example.com</a>. We aim to respond within one
        business day.
      </p>

      <h2>Support</h2>
      <p>
        Got a bug or a feature request? Send it to{' '}
        <a href="mailto:hello@example.com">hello@example.com</a> with as much detail as you can —
        what you tried, what happened, and what you expected to happen instead.
      </p>

      <h2>Press &amp; partnerships</h2>
      <p>
        Edit this section with the right contact for press, partnerships, or anything that
        isn&apos;t day-to-day support.
      </p>
    </main>
  );
}
