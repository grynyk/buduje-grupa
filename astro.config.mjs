// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  site: 'https://buduje-grupa.eu',
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
