import { organization, webSite } from '@answerable/schemas';
import Link from 'next/link';

const orgSchema = organization({
  name: 'Basic Next.js Example',
  url: 'https://example.com',
  description: 'The minimal example of an Answerable-powered Next.js site.',
  sameAs: ['https://github.com/Anuj7411/answerable'],
});

const siteSchema = webSite({
  name: 'Basic Next.js Example',
  url: 'https://example.com',
  description: 'The minimal example of an Answerable-powered Next.js site.',
});

export default function HomePage() {
  return (
    <main>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: required for JSON-LD injection
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: required for JSON-LD injection
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
      />
      <h1>Basic Next.js Example</h1>
      <p>
        This is the minimal Next.js App Router example showing how every <code>@answerable/*</code>{' '}
        package wires together. Read each file under <code>app/</code> to see one piece of the
        toolkit in action.
      </p>

      <h2>Try it</h2>
      <p>Audit this site (or any live URL) with the Answerable CLI:</p>
      <pre>
        <code>pnpm dlx @answerable/cli audit http://localhost:3000</code>
      </pre>

      <h2>Pages</h2>
      <ul>
        <li>
          <Link href="/about">About</Link> — uses <code>organization()</code> JSON-LD
        </li>
        <li>
          <Link href="/faq">FAQ</Link> — uses <code>faqPage()</code> JSON-LD
        </li>
        <li>
          <Link href="/privacy">Privacy policy</Link>
        </li>
        <li>
          <Link href="/terms">Terms of use</Link>
        </li>
        <li>
          <Link href="/contact">Contact</Link>
        </li>
      </ul>
    </main>
  );
}
