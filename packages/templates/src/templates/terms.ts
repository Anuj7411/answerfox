import type { Template } from '../types.js';

const CONTENT = `import { defineSeo } from '@answerable/metadata';

export const metadata = defineSeo({
  title: 'Terms of Use — {{PROJECT_NAME}}',
  description: 'The rules of the road when using {{PROJECT_NAME}}.',
  url: '{{URL}}/terms',
});

export default function TermsPage() {
  return (
    <main>
      <h1>Terms of Use</h1>
      <p>
        <em>Effective {{EFFECTIVE_DATE}}.</em>
      </p>

      <h2>Agreement</h2>
      <p>
        By accessing or using {{PROJECT_NAME}} (the &quot;Service&quot;, at{' '}
        <a href="https://{{DOMAIN}}">{{DOMAIN}}</a>), you agree to these Terms of
        Use. If you do not agree, do not use the Service.
      </p>

      <h2>Acceptable use</h2>
      <p>
        You agree not to use the Service to violate any law, infringe anyone&apos;s
        rights, transmit malware, scrape at unreasonable rates, or impersonate
        any person.
      </p>

      <h2>Intellectual property</h2>
      <p>
        All content, branding, and code that makes up {{PROJECT_NAME}} is owned
        by us or our licensors. You retain ownership of any content you submit.
      </p>

      <h2>Disclaimer and limitation of liability</h2>
      <p>
        The Service is provided &quot;as is.&quot; To the maximum extent permitted
        by law, {{PROJECT_NAME}} disclaims all warranties and shall not be liable
        for any indirect, incidental, or consequential damages.
      </p>

      <h2>Governing law</h2>
      <p>
        These Terms are governed by the laws of {{JURISDICTION}}, without regard
        to its conflict-of-laws provisions.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these Terms; the &quot;Effective&quot; date above will
        always reflect the current version. Continued use of the Service after
        an update constitutes acceptance of the revised Terms.
      </p>
    </main>
  );
}
`;

export const termsTemplate: Template = {
  name: 'terms',
  filename: 'app/terms/page.tsx',
  content: CONTENT,
  requiredTokens: ['DOMAIN', 'EFFECTIVE_DATE', 'JURISDICTION', 'PROJECT_NAME', 'URL'],
};
