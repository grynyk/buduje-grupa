/** /sitemap.xml — every indexable page, realization and catalog design (pages marked "noindex" are left out). */
import type { APIRoute } from 'astro';
import { designPath, getCatalog, getPages, getProjects, pagePath, projectPath } from '@/lib/content';

export const GET: APIRoute = async ({ site }) => {
  const [pages, projects, designs] = await Promise.all([getPages(), getProjects(), getCatalog()]);
  const paths = [
    ...pages.filter((p) => !p.data.seo.noindex).map((p) => pagePath(p.id)),
    ...projects.filter((p) => !p.data.seo?.noindex).map((p) => projectPath(p.id)),
    ...designs.filter((d) => !d.data.seo?.noindex).map((d) => designPath(d.id)),
  ];
  const urls = paths.map((path) => `  <url><loc>${new URL(path, site)}</loc></url>`).join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
