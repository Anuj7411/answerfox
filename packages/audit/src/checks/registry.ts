import type { Check } from '@answerfox/core';
import type { AuditDom } from '../parser.js';
import { a1Title } from './a1-title.js';
import { a3Description } from './a3-description.js';
import { a4Canonical } from './a4-canonical.js';
import { a5HtmlLang } from './a5-html-lang.js';
import { a6Viewport } from './a6-viewport.js';
import { a7Charset } from './a7-charset.js';
import { a8Robots } from './a8-robots.js';
import { a9Favicon } from './a9-favicon.js';
import { a10AppleTouchIcon } from './a10-apple-touch.js';
import { b1SingleH1 } from './b1-single-h1.js';
import { b3HeadingHierarchy } from './b3-heading-hierarchy.js';
import { b4H2Sections } from './b4-h2-sections.js';
import { b8ExternalCitations } from './b8-external-citations.js';
import { b11InternalLinks } from './b11-internal-links.js';
import { b14ListsOrTables } from './b14-lists-or-tables.js';
import { c1JsonLd } from './c1-json-ld.js';
import { c2Organization } from './c2-organization.js';
import { d1AboutPageLinked } from './d1-about-page-linked.js';
import { d2PrivacyLinked } from './d2-privacy-linked.js';
import { d3TermsLinked } from './d3-terms-linked.js';
import { d4ContactAccessible } from './d4-contact-accessible.js';
import { d5ChromeTrustLink } from './d5-chrome-trust-link.js';
import { d6FooterTrustLinks } from './d6-footer-trust-links.js';
import { e1ReviewProfile } from './e1-review-profile.js';
import { e7GithubLinked } from './e7-github-linked.js';
import { e10SameAsThree } from './e10-same-as-three.js';
import { e11LinkedinLinked } from './e11-linkedin-linked.js';
import { f1OgTitle } from './f1-og-title.js';
import { f2OgDescription } from './f2-og-description.js';
import { f3OgImage } from './f3-og-image.js';
import { f5OgUrl } from './f5-og-url.js';
import { f6TwitterCard } from './f6-twitter-card.js';
import { f7TwitterImage } from './f7-twitter-image.js';
import { g1McpServerCard } from './g1-mcp-server-card.js';
import { g2AgentCard } from './g2-agent-card.js';
import { g3ApiCatalog } from './g3-api-catalog.js';
import { g4AgentPermissions } from './g4-agent-permissions.js';
import { g5OauthDiscovery } from './g5-oauth-discovery.js';
import { g6WebmcpForm } from './g6-webmcp-form.js';

/**
 * Total number of audit checks planned in the full AUDIT-FRAMEWORK.md
 * spec. `DEFAULT_CHECKS.length` divided by this number is the engine's
 * current spec coverage. Surfaced in reporters so users know the
 * framework is shipping incrementally rather than inferring "100/100
 * means perfect site forever."
 *
 * v0.3.0 expanded the spec from 50 to 56 by adding category G
 * (agent-readiness): G1 MCP Server Card, G2 A2A agent-card.json,
 * G3 RFC 9727 API Catalog, G4 agent-permissions.json, G5 RFC 8414
 * OAuth discovery, G6 WebMCP form annotations.
 */
export const TOTAL_PLANNED_CHECKS = 56;

/**
 * Every check registered with the audit engine, in stable AUDIT-FRAMEWORK
 * order. Subsequent PRs append to this list — never reorder, never
 * renumber. Stable IDs (`A1`, `A3`, ...) are part of the public API
 * (users pin `--ignore A4` in CI).
 */
export const DEFAULT_CHECKS: readonly Check<AuditDom>[] = [
  a1Title,
  a3Description,
  a4Canonical,
  a5HtmlLang,
  a6Viewport,
  a7Charset,
  a8Robots,
  a9Favicon,
  a10AppleTouchIcon,
  b1SingleH1,
  b3HeadingHierarchy,
  b4H2Sections,
  b8ExternalCitations,
  b11InternalLinks,
  b14ListsOrTables,
  c1JsonLd,
  c2Organization,
  d1AboutPageLinked,
  d2PrivacyLinked,
  d3TermsLinked,
  d4ContactAccessible,
  d5ChromeTrustLink,
  d6FooterTrustLinks,
  e1ReviewProfile,
  e7GithubLinked,
  e10SameAsThree,
  e11LinkedinLinked,
  f1OgTitle,
  f2OgDescription,
  f3OgImage,
  f5OgUrl,
  f6TwitterCard,
  f7TwitterImage,
  // Category G (agent-readiness, v0.3.0+): informational checks for AI-agent
  // manifests. Score-neutral (points: 0). See ROADMAP.md for v0.4 scoring plan.
  g1McpServerCard,
  g2AgentCard,
  g3ApiCatalog,
  g4AgentPermissions,
  g5OauthDiscovery,
  g6WebmcpForm,
];
