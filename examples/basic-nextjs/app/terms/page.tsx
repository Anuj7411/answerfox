import { defineSeo } from '@answerable/metadata';

export const metadata = defineSeo({
  title: 'Terms of Use — Basic Next.js Example',
  description: 'The rules of the road when using Basic Next.js Example.',
  url: 'https://example.com/terms',
});

export default function TermsPage() {
  return (
    <main>
      <h1>Terms of Use</h1>
      <p>
        <em>Effective 2026-05-15.</em>
      </p>

      <h2>Agreement</h2>
      <p>
        By accessing or using Basic Next.js Example (the &quot;Service&quot;, at{' '}
        <a href="https://example.com">example.com</a>), you agree to these Terms of Use. If you do
        not agree, do not use the Service.
      </p>

      <h2>Acceptable use</h2>
      <p>
        You agree not to use the Service to violate any law, infringe anyone&apos;s rights, transmit
        malware, scrape at unreasonable rates, or impersonate any person.
      </p>

      <h2>Intellectual property</h2>
      <p>
        All content, branding, and code that makes up Basic Next.js Example is owned by us or our
        licensors. You retain ownership of any content you submit.
      </p>

      <h2>Disclaimer and limitation of liability</h2>
      <p>
        The Service is provided &quot;as is.&quot; To the maximum extent permitted by law, Basic
        Next.js Example disclaims all warranties and shall not be liable for any indirect,
        incidental, or consequential damages.
      </p>

      <h2>Governing law</h2>
      <p>
        These Terms are governed by the laws of the State of Delaware, USA, without regard to its
        conflict-of-laws provisions.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these Terms; the &quot;Effective&quot; date above will always reflect the
        current version. Continued use of the Service after an update constitutes acceptance of the
        revised Terms.
      </p>
    </main>
  );
}
