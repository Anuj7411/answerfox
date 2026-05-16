import { defineSeo } from '@answerable/metadata';
import { faqPage } from '@answerable/schemas';

export const metadata = defineSeo({
  title: 'FAQ — Basic Next.js Example',
  description: 'Frequently asked questions about Basic Next.js Example.',
  url: 'https://example.com/faq',
});

const faqSchema = faqPage({
  questions: [
    {
      question: 'What is Basic Next.js Example?',
      answer: 'The minimal example of an Answerable-powered Next.js site.',
    },
    {
      question: 'How do I get started?',
      answer:
        'Visit https://example.com and follow the prompts. Edit this answer with your real onboarding steps.',
    },
    {
      question: 'How much does Basic Next.js Example cost?',
      answer:
        'Edit this answer with your pricing details — or link to a pricing page if you have one.',
    },
    {
      question: 'How do I contact support?',
      answer: 'Email us at hello@example.com and we will respond within one business day.',
    },
  ],
});

export default function FaqPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: required for JSON-LD injection
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <h1>Frequently asked questions</h1>

      <h2>What is Basic Next.js Example?</h2>
      <p>The minimal example of an Answerable-powered Next.js site.</p>

      <h2>How do I get started?</h2>
      <p>
        Visit <a href="https://example.com">https://example.com</a> and follow the prompts. Edit
        this answer with your real onboarding steps.
      </p>

      <h2>How much does Basic Next.js Example cost?</h2>
      <p>Edit this answer with your pricing details — or link to a pricing page if you have one.</p>

      <h2>How do I contact support?</h2>
      <p>
        Email us at <a href="mailto:hello@example.com">hello@example.com</a> and we will respond
        within one business day.
      </p>
    </main>
  );
}
