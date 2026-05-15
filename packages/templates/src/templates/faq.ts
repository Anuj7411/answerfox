import type { Template } from '../types.js';

const CONTENT = `import { defineSeo } from '@answerable/metadata';
import { faqPage } from '@answerable/schemas';

export const metadata = defineSeo({
  title: 'FAQ — {{PROJECT_NAME}}',
  description: 'Frequently asked questions about {{PROJECT_NAME}}.',
  url: '{{URL}}/faq',
});

const faqSchema = faqPage({
  questions: [
    {
      question: 'What is {{PROJECT_NAME}}?',
      answer: '{{DESCRIPTION}}',
    },
    {
      question: 'How do I get started?',
      answer:
        'Visit {{URL}} and follow the prompts. Edit this answer with your real onboarding steps.',
    },
    {
      question: 'How much does {{PROJECT_NAME}} cost?',
      answer:
        'Edit this answer with your pricing details — or link to a pricing page if you have one.',
    },
    {
      question: 'How do I contact support?',
      answer:
        'Email us at {{CONTACT_EMAIL}} and we will respond within one business day.',
    },
  ],
});

export default function FaqPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <h1>Frequently asked questions</h1>

      <h2>What is {{PROJECT_NAME}}?</h2>
      <p>{{DESCRIPTION}}</p>

      <h2>How do I get started?</h2>
      <p>
        Visit <a href="{{URL}}">{{URL}}</a> and follow the prompts. Edit this
        answer with your real onboarding steps.
      </p>

      <h2>How much does {{PROJECT_NAME}} cost?</h2>
      <p>
        Edit this answer with your pricing details — or link to a pricing page
        if you have one.
      </p>

      <h2>How do I contact support?</h2>
      <p>
        Email us at <a href="mailto:{{CONTACT_EMAIL}}">{{CONTACT_EMAIL}}</a> and
        we will respond within one business day.
      </p>
    </main>
  );
}
`;

export const faqTemplate: Template = {
  name: 'faq',
  filename: 'app/faq/page.tsx',
  content: CONTENT,
  requiredTokens: ['CONTACT_EMAIL', 'DESCRIPTION', 'PROJECT_NAME', 'URL'],
};
