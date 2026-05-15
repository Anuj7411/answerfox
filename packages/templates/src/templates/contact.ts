import type { Template } from '../types.js';

const CONTENT = `import { defineSeo } from '@answerable/metadata';

export const metadata = defineSeo({
  title: 'Contact — {{PROJECT_NAME}}',
  description: 'How to reach the {{PROJECT_NAME}} team.',
  url: '{{URL}}/contact',
});

export default function ContactPage() {
  return (
    <main>
      <h1>Contact {{PROJECT_NAME}}</h1>
      <p>
        The fastest way to reach us is by email at{' '}
        <a href="mailto:{{CONTACT_EMAIL}}">{{CONTACT_EMAIL}}</a>. We aim to
        respond within one business day.
      </p>

      <h2>Support</h2>
      <p>
        Got a bug or a feature request? Send it to{' '}
        <a href="mailto:{{CONTACT_EMAIL}}">{{CONTACT_EMAIL}}</a> with as much
        detail as you can — what you tried, what happened, and what you
        expected to happen instead.
      </p>

      <h2>Press &amp; partnerships</h2>
      <p>
        Edit this section with the right contact for press, partnerships, or
        anything that isn&apos;t day-to-day support.
      </p>
    </main>
  );
}
`;

export const contactTemplate: Template = {
  name: 'contact',
  filename: 'app/contact/page.tsx',
  content: CONTENT,
  requiredTokens: ['CONTACT_EMAIL', 'PROJECT_NAME', 'URL'],
};
