import type { Template } from '../types.js';

const CONTENT = `import { defineSeo } from '@answerable/metadata';

export const metadata = defineSeo({
  title: 'Privacy Policy — {{PROJECT_NAME}}',
  description: 'How {{PROJECT_NAME}} collects, uses, and protects your data.',
  url: '{{URL}}/privacy',
});

export default function PrivacyPage() {
  return (
    <main>
      <h1>Privacy Policy</h1>
      <p>
        <em>Effective {{EFFECTIVE_DATE}}.</em>
      </p>

      <h2>What we collect</h2>
      <p>
        {{PROJECT_NAME}} (operated from {{DOMAIN}}) collects only the data needed
        to provide our service. Edit this section to list every category of
        personal data your application collects from users.
      </p>

      <h2>How we use it</h2>
      <p>
        We use collected data to operate, maintain, and improve {{PROJECT_NAME}}.
        We never sell your personal data to third parties.
      </p>

      <h2>Who we share with</h2>
      <p>
        Edit this section to list every third-party processor (analytics,
        payments, transactional email, etc.) and link to their own privacy policy.
      </p>

      <h2>Your rights</h2>
      <p>
        You may request a copy of your data, ask us to delete it, or correct
        inaccurate records by emailing{' '}
        <a href="mailto:{{CONTACT_EMAIL}}">{{CONTACT_EMAIL}}</a>.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Reach us at{' '}
        <a href="mailto:{{CONTACT_EMAIL}}">{{CONTACT_EMAIL}}</a>.
      </p>
    </main>
  );
}
`;

export const privacyTemplate: Template = {
  name: 'privacy',
  filename: 'app/privacy/page.tsx',
  content: CONTENT,
  requiredTokens: ['CONTACT_EMAIL', 'DOMAIN', 'EFFECTIVE_DATE', 'PROJECT_NAME', 'URL'],
};
