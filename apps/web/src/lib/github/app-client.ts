import 'server-only';
import { App } from '@octokit/app';
import type { GitHubClient } from './create-fix-pr';

/**
 * The AnswerFox GitHub App, authenticated from env. The private key is
 * stored inline (Cloudflare Workers has no filesystem) with escaped
 * newlines, so we un-escape it here.
 *
 * `getInstallationClient` returns an Octokit scoped to one installation
 * whose `request` matches the narrow `GitHubClient` interface that
 * `createFixPr` consumes — so the PR pipeline stays testable against a
 * fake while production swaps in the real installation token.
 */

let cachedApp: App | null = null;

function getApp(): App {
  if (cachedApp) return cachedApp;
  const appId = process.env.GITHUB_APP_ID ?? '';
  const rawKey = process.env.GITHUB_APP_PRIVATE_KEY ?? '';
  if (appId.length === 0 || rawKey.length === 0) {
    throw new Error('GITHUB_APP_ID or GITHUB_APP_PRIVATE_KEY is not set.');
  }
  const privateKey = rawKey.includes('\\n') ? rawKey.replace(/\\n/g, '\n') : rawKey;
  cachedApp = new App({ appId, privateKey });
  return cachedApp;
}

/** App-level Octokit (JWT auth) for App-scoped calls like listing installations. */
export function getAppOctokit() {
  return getApp().octokit;
}

/** Installation-scoped client for a given installation id. */
export async function getInstallationClient(installationId: number): Promise<GitHubClient> {
  const octokit = await getApp().getInstallationOctokit(installationId);
  return {
    request: (route: string, params?: Record<string, unknown>) => octokit.request(route, params),
  };
}
