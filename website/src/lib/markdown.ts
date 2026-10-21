import { Marked } from 'marked';
import markedKatex from 'marked-katex-extension';
import { withBase } from './base';
import { getAllEpisodes } from './episodes';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface ParsedMarkdown {
  html: string;
  toc: TocItem[];
}

export function parseMarkdown(rawContent: string): ParsedMarkdown {
  const toc: TocItem[] = [];
  const allEps = getAllEpisodes();

  // Map of filename or decoded filename to episode url
  const epUrlMap = new Map<string, string>();
  for (const ep of allEps) {
    const url = withBase(`/episodes/${ep.seasonSlug}/${ep.slug}`);
    epUrlMap.set(ep.filename, url);
    epUrlMap.set(encodeURIComponent(ep.filename), url);
    // Also without extension
    epUrlMap.set(ep.filename.replace(/\.md$/, ''), url);
  }

  // Strip initial chapter title and metadata if it's an episode treatment
  let cleanContent = rawContent;
  const headerMatch = cleanContent.match(/^#\s+[^\n]+\n+Part of\s+\[\*Colonies and Colonial Power\*\][^\n]*\n+\*\*Before \/ after:\*\*[^\n]*\n+/);
  if (headerMatch) {
    cleanContent = cleanContent.substring(headerMatch[0].length).trim();
  }

  const marked = new Marked();

  marked.use(
    markedKatex({
      throwOnError: false,
    })
  );

  marked.use({
    renderer: {
      heading({ text, depth }) {
        const rawText = text.replace(/<[^>]*>/g, '').trim();
        const id = rawText
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');

        if (depth === 2 || depth === 3) {
          toc.push({
            id,
            text: rawText,
            level: depth,
          });
        }

        return `<h${depth} id="${id}" class="content-heading heading-l${depth}"><a href="#${id}" class="heading-anchor" aria-hidden="true">#</a><span>${text}</span></h${depth}>`;
      },

      link({ href, title, text }) {
        if (!href) return text;

        let targetHref = href;
        let isExternal = false;

        if (href.startsWith('http://') || href.startsWith('https://')) {
          isExternal = true;
        } else {
          let [url, hash] = href.split('#');
          const anchor = hash ? `#${hash}` : '';
          const decoded = decodeURIComponent(url);

          if (url === 'README.md' || decoded === 'README.md') {
            targetHref = withBase(`/${anchor}`);
          } else if (url === 'SEASONS_AND_PATHS.md' || decoded === 'SEASONS_AND_PATHS.md') {
            targetHref = withBase(`/paths${anchor}`);
          } else if (url === 'COMPARATIVE_MATRIX.md' || decoded === 'COMPARATIVE_MATRIX.md') {
            targetHref = withBase(`/matrix${anchor}`);
          } else if (url === 'PRODUCTION_GUIDE.md' || decoded === 'PRODUCTION_GUIDE.md') {
            targetHref = withBase(`/guide${anchor}`);
          } else if (url === 'SOURCE_CATALOG.md' || decoded === 'SOURCE_CATALOG.md') {
            targetHref = withBase(`/sources${anchor}`);
          } else if (url === 'RIGHTS_AND_FACTCHECK.md' || decoded === 'RIGHTS_AND_FACTCHECK.md') {
            targetHref = withBase(`/factcheck${anchor}`);
          } else {
            // Check if matches an episode filename
            const match = allEps.find(
              (e) => e.filename === url || e.filename === decoded || encodeURIComponent(e.filename) === url
            );
            if (match) {
              targetHref = withBase(`/episodes/${match.seasonSlug}/${match.slug}${anchor}`);
            } else {
              // Try prefix match for numbers like 02%20...
              const numMatch = decoded.match(/^(\d{2})/);
              if (numMatch) {
                const targetEp = allEps.find((e) => e.epNum === parseInt(numMatch[1], 10));
                if (targetEp) {
                  targetHref = withBase(`/episodes/${targetEp.seasonSlug}/${targetEp.slug}${anchor}`);
                }
              }
            }
          }
        }

        const titleAttr = title ? ` title="${title}"` : '';
        const extAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${targetHref}"${titleAttr}${extAttr} class="prose-link">${text}</a>`;
      },

      table({ header, rows }) {
        return `<div class="table-container"><table><thead>${header}</thead><tbody>${rows}</tbody></table></div>`;
      },

      code({ text, lang }) {
        const isDiagram = !lang || lang === 'text' || lang === 'ascii' || text.includes('+---') || text.includes('|');
        const diagramClass = isDiagram ? 'ascii-diagram' : '';
        return `<pre class="code-block ${diagramClass}"><code class="language-${lang || 'text'}">${text}</code></pre>`;
      },

      blockquote({ text }) {
        return `<blockquote class="prose-quote">${text}</blockquote>`;
      },
    },
  });

  const html = marked.parse(cleanContent) as string;

  return {
    html,
    toc,
  };
}
