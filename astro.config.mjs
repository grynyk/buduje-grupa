// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  site: 'https://buduje-grupa.eu',
  // One URL per page, no trailing slash: /o-nas → dist/o-nas.html.
  // Cloudflare serves it at /o-nas and redirects /o-nas/ there, so links, canonicals and the sitemap all agree.
  trailingSlash: 'never',
  build: { format: 'file' },
  vite: {
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    css: {
      preprocessorOptions: {
        scss: {
          // Mixins & breakpoints available in every <style lang="scss"> block
          additionalData: `@use "@/styles/abstracts" as *;\n`,
        },
      },
    },
  },
});
