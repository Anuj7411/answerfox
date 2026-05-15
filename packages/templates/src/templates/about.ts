import type { Template } from '../types.js';

const CONTENT = `import { defineSeo } from '@answerable/metadata';
import { organization } from '@answerable/schemas';

export const metadata = defineSeo({
  title: 'About {{PROJECT_NAME}}',
  description: 'Learn about {{PROJECT_NAME}}, the team behind {{DOMAIN}}.',
  url: '{{URL}}/about',
});

const orgSchema = organization({
  name: '{{PROJECT_NAME}}',
  url: '{{URL}}',
  description: '{{DESCRIPTION}}',
});

export default function AboutPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <h1>About {{PROJECT_NAME}}</h1>
      <p>{{DESCRIPTION}}</p>

      <h2>Who we are</h2>
      <p>
        Edit this section to introduce the team behind {{PROJECT_NAME}} — who
        you are, where you&apos;re based, and why you started.
      </p>

      <h2>What we believe</h2>
      <p>
        Edit this section to spell out your principles: how you approach the
        problem, what you refuse to do, what we promise users.
      </p>

      <h2>Get in touch</h2>
      <p>
        Reach the {{PROJECT_NAME}} team via the{' '}
        <a href="{{URL}}/contact">contact page</a>.
      </p>
    </main>
  );
}
`;

export const aboutTemplate: Template = {
  name: 'about',
  filename: 'app/about/page.tsx',
  content: CONTENT,
  requiredTokens: ['DESCRIPTION', 'DOMAIN', 'PROJECT_NAME', 'URL'],
};
