import { defineSeo } from '@answerable/metadata';

export const metadata = defineSeo({
  title: 'Privacy Policy — Basic Next.js Example',
  description: 'How Basic Next.js Example collects, uses, and protects your data.',
  url: 'https://example.com/privacy',
});

export default function PrivacyPage() {
  return (
    <main>
      <h1>Privacy Policy</h1>
      <p>
        <em>Effective 2026-05-15.</em>
      </p>

      <h2>What we collect</h2>
      <p>
        Basic Next.js Example (operated from example.com) collects only the data needed to provide
        our service. Edit this section to list every category of personal data your application
        collects from users.
      </p>

      <h2>How we use it</h2>
      <p>
        We use collected data to operate, maintain, and improve Basic Next.js Example. We never sell
        your personal data to third parties.
      </p>

      <h2>Who we share with</h2>
      <p>
        Edit this section to list every third-party processor (analytics, payments, transactional
        email, etc.) and link to their own privacy policy.
      </p>

      <h2>Your rights</h2>
      <p>
        You may request a copy of your data, ask us to delete it, or correct inaccurate records by
        emailing <a href="mailto:hello@example.com">hello@example.com</a>.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Reach us at{' '}
        <a href="mailto:hello@example.com">hello@example.com</a>.
      </p>
    </main>
  );
}
