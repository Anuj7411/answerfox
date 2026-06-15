'use client';

import { useState } from 'react';

function Check() {
  return (
    <svg className="ck" width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <title>included</title>
      <path
        d="M3.5 8.5l2.8 2.8L12.5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const FREE_FEATURES = [
  'Audit engine, SEO + AEO + GEO',
  'CLI: pnpm dlx @answerfox/cli',
  'GitHub Action for PR audits',
  'Public score badge for your README',
  'Latest audit in the web dashboard',
];

const PRO_FEATURES = [
  'AI fixes as code, 90 / month',
  'Auto-audits every 24 hours',
  '30-day history + trend graphs',
  'Up to 3 sites',
  'Detailed evidence per finding',
];

export function PricingPlans() {
  const [annual, setAnnual] = useState(false);
  const proPrice = annual ? 25 : 29;
  const billLine = annual ? 'billed $300/yr, save $48' : 'billed monthly';

  const knobStyle = annual
    ? { left: 'calc(50% + 0px)', width: 'calc(50% - 4px)' }
    : { left: 4, width: 'calc(50% - 4px)' };

  return (
    <>
      {/* biome-ignore lint/a11y/useSemanticElements: stateful button-group toggle, not a form fieldset */}
      <div className="toggle" role="group" aria-label="Billing cadence">
        <span className="knob" style={knobStyle} />
        <button
          type="button"
          className={annual ? '' : 'on'}
          onClick={() => setAnnual(false)}
          aria-pressed={!annual}
        >
          Monthly
        </button>
        <button
          type="button"
          className={annual ? 'on' : ''}
          onClick={() => setAnnual(true)}
          aria-pressed={annual}
        >
          Annual <span className="save">−15%</span>
        </button>
      </div>

      <div className="cards">
        <div className="card">
          <div className="name">Free</div>
          <div className="price">
            <span className="amt">$0</span>
            <span className="per">forever</span>
          </div>
          <div className="bill" />
          <p className="tag">For trying it out, CI checks, and self-hosting.</p>
          <ul className="feat">
            {FREE_FEATURES.map((f) => (
              <li key={f}>
                <span className="ck">
                  <Check />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <a href="https://github.com/Anuj7411/answerfox" className="btn btn-ghost" type="button">
            Install the CLI
          </a>
        </div>

        <div className="card pro">
          <span className="pop">Most popular</span>
          <div className="name">Pro</div>
          <div className="price">
            <span className="amt">${proPrice}</span>
            <span className="per">/ month</span>
          </div>
          <div className="bill">{billLine}</div>
          <p className="tag">For founders and teams who ship weekly.</p>
          <ul className="feat">
            <li className="lead">
              <span className="ck">
                <Check />
              </span>
              Everything in Free, plus:
            </li>
            {PRO_FEATURES.map((f) => (
              <li key={f}>
                <span className="ck">
                  <Check />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <a href="/sign-in" className="btn btn-solid" type="button">
            Start Pro
          </a>
          <div className="seat">14-day trial, no card required</div>
        </div>
      </div>
    </>
  );
}
