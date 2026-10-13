// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';

export default defineConfig({
  site: 'https://ethanet.xyz',
  integrations: [
    // Code blocks: copy button, ```yaml title="file.yaml", {2-4} line marks, ins={3} del={4}, diff blocks.
    expressiveCode({
      themes: ['github-dark', 'github-light'],
      // Follow the site's theme toggle (data-theme) and fall back to the OS setting.
      themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
      useDarkModeMediaQuery: true,
      styleOverrides: {
        borderRadius: '10px',
        codeFontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Consolas, monospace",
        codeFontSize: '0.875rem',
        uiFontFamily: "'Inter', system-ui, sans-serif",
        frames: { shadowColor: 'transparent' },
      },
    }),
    sitemap(),
  ],
});
