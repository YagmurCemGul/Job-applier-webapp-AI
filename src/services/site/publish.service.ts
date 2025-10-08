/**
 * @fileoverview Static site publishing and deployment adapters.
 * @module services/site/publish
 */

import type { SiteState, DeployResult, ExportResult } from '@/types/site.types';
import { mdToHtml } from './markdown.service';
import { buildMeta, buildSitemap, buildRobotsTxt } from './seo.service';

/**
 * Export site as a static ZIP file (client-side).
 */
export async function exportStaticZip(site: SiteState): Promise<ExportResult> {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();

  // CSS
  const css = `
    * { box-sizing: border-box; }
    body {
      font-family: ${site.theme.fontBody}, system-ui, sans-serif;
      margin: 0;
      color: #111827;
      background: #ffffff;
      line-height: 1.6;
    }
    a { color: ${site.theme.accent}; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .container { max-width: 920px; margin: 0 auto; padding: 24px; }
    header { padding: 24px; border-bottom: 1px solid #e5e7eb; }
    footer { padding: 24px; border-top: 1px solid #e5e7eb; margin-top: 48px; }
    h1, h2, h3 { font-family: ${site.theme.fontHead}, system-ui, sans-serif; }
    ul { padding-left: 24px; }
    pre { background: #f1f5f9; padding: 16px; border-radius: 8px; overflow-x: auto; }
    code { font-family: 'Courier New', monospace; }
  `;
  zip.file('assets/styles.css', css);

  // Index page
  const indexHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${buildMeta({
    title: site.profile.headline || 'Portfolio',
    description: site.profile.bio?.slice(0, 160),
    noAI: site.noAITrainingMeta,
  })}
  <link rel="stylesheet" href="assets/styles.css">
</head>
<body>
  <header class="container">
    <h1>${escapeHtml(site.profile.headline || 'My Portfolio')}</h1>
    <p>${escapeHtml(site.profile.bio || '')}</p>
    ${
      site.profile.links.length > 0
        ? `<nav>${site.profile.links
            .map((l) => `<a href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`)
            .join(' • ')}</nav>`
        : ''
    }
  </header>
  <main class="container">
    <section>
      <h2>Case Studies</h2>
      <ul>
        ${site.cases
          .filter((c) => c.visibility === 'public')
          .map(
            (c) =>
              `<li><a href="cases/${c.slug}.html">${escapeHtml(c.title)}</a> — ${escapeHtml(c.excerpt ?? '')}</li>`
          )
          .join('')}
      </ul>
    </section>
    <section>
      <h2>Blog</h2>
      <ul>
        ${site.posts
          .filter((p) => p.visibility === 'public')
          .map(
            (p) =>
              `<li><a href="blog/${p.slug}.html">${escapeHtml(p.title)}</a> — ${new Date(p.dateISO).toLocaleDateString()}</li>`
          )
          .join('')}
      </ul>
    </section>
  </main>
  <footer class="container">
    <small>© ${new Date().getFullYear()} — Published with JobPilot</small>
  </footer>
</body>
</html>`;
  zip.file('index.html', indexHtml);

  // Case pages
  for (const c of site.cases.filter((x) => x.visibility === 'public')) {
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${buildMeta({
    title: c.title,
    description: c.excerpt,
    noAI: site.noAITrainingMeta,
  })}
  <link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
  <header class="container">
    <a href="../index.html">← Back to Portfolio</a>
  </header>
  <main class="container">
    ${mdToHtml(c.contentMd)}
    ${c.links && c.links.length > 0 ? `<section><h2>Links</h2><ul>${c.links.map((l) => `<li><a href="${l}" target="_blank" rel="noopener">${l}</a></li>`).join('')}</ul></section>` : ''}
  </main>
  <footer class="container">
    <small>© ${new Date().getFullYear()}</small>
  </footer>
</body>
</html>`;
    zip.file(`cases/${c.slug}.html`, html);
  }

  // Blog pages
  for (const p of site.posts.filter((x) => x.visibility === 'public')) {
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${buildMeta({
    title: p.title,
    description: p.contentMd.slice(0, 140),
    noAI: site.noAITrainingMeta,
  })}
  <link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
  <header class="container">
    <a href="../index.html">← Back to Portfolio</a>
  </header>
  <main class="container">
    <article>
      <time datetime="${p.dateISO}">${new Date(p.dateISO).toLocaleDateString()}</time>
      ${mdToHtml(p.contentMd)}
    </article>
  </main>
  <footer class="container">
    <small>© ${new Date().getFullYear()}</small>
  </footer>
</body>
</html>`;
    zip.file(`blog/${p.slug}.html`, html);
  }

  // Sitemap
  const slugs = [''].concat(
    site.cases.filter((c) => c.visibility === 'public').map((c) => `cases/${c.slug}.html`),
    site.posts.filter((p) => p.visibility === 'public').map((p) => `blog/${p.slug}.html`)
  );
  zip.file('sitemap.xml', buildSitemap('https://example.com', slugs));
  zip.file('robots.txt', buildRobotsTxt('https://example.com/sitemap.xml'));

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  return { url, size: blob.size };
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (m) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[m]!
  );
}

// ============================================================================
// Hosting Adapters (Stubs — replace with server calls in production)
// ============================================================================

/**
 * Deploy to Vercel (stub).
 * In production: upload via Vercel REST API or CLI.
 */
export async function deployToVercel(_site: SiteState): Promise<DeployResult> {
  // Stub: simulate deployment
  return {
    url: 'https://your-site.vercel.app',
    deploymentId: crypto.randomUUID(),
  };
}

/**
 * Deploy to Netlify (stub).
 * In production: upload via Netlify API.
 */
export async function deployToNetlify(_site: SiteState): Promise<DeployResult> {
  return {
    url: 'https://your-site.netlify.app',
    siteId: crypto.randomUUID(),
  };
}

/**
 * Deploy to GitHub Pages (stub).
 * In production: push to gh-pages branch via GitHub API.
 */
export async function deployToGitHubPages(
  _site: SiteState
): Promise<DeployResult> {
  return {
    url: 'https://username.github.io/your-site',
    repo: 'user/your-site',
  };
}