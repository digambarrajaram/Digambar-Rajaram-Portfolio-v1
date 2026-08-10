import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const __dirname = import.meta?.dirname ?? new URL('.', import.meta.url).pathname;

function ensureCssBeforeScripts(): {
  name: string;
  transformIndexHtml(html: string): string;
} {
  return {
    name: 'css-before-scripts',
    transformIndexHtml(html) {
      // Move any <link rel="stylesheet"> before the first <script> so CSS
      // is discovered and downloaded before JS, unblocking FCP.
      const linkPattern = /(<link\s[^>]*\brel=["']stylesheet["'][^>]*\/?>)/gi;
      const links: string[] = [];
      let cleaned = html.replace(linkPattern, (match) => {
        links.push(match);
        return '';
      });
      if (links.length === 0) return html;
      // Insert all collected stylesheet links just before the first <script>
      cleaned = cleaned.replace(/(<script\b)/, links.join('\n    ') + '\n    $1');
      return cleaned;
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), ensureCssBeforeScripts()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;

            // React core — changes rarely, benefits most from long-term caching
            if (id.includes('node_modules/react') ||
                id.includes('node_modules/react-dom') ||
                id.includes('node_modules/scheduler')) {
              return 'react-vendor';
            }

            // Animation + icon libs — moderate size, moderate change frequency
            if (id.includes('node_modules/motion') ||
                id.includes('node_modules/framer-motion') ||
                id.includes('node_modules/lucide-react')) {
              return 'ui-vendor';
            }

            // Markdown parser — heavy, only used in chat
            if (id.includes('node_modules/react-markdown') ||
                id.includes('node_modules/mdast') ||
                id.includes('node_modules/unified') ||
                id.includes('node_modules/remark') ||
                id.includes('node_modules/micromark') ||
                id.includes('node_modules/decode-named-character-reference') ||
                id.includes('node_modules/property-information') ||
                id.includes('node_modules/hast') ||
                id.includes('node_modules/unist') ||
                id.includes('node_modules/vfile') ||
                id.includes('node_modules/bail') ||
                id.includes('node_modules/is-plain-obj') ||
                id.includes('node_modules/trough') ||
                id.includes('node_modules/trim-lines') ||
                id.includes('node_modules/space-separated-tokens') ||
                id.includes('node_modules/comma-separated-tokens') ||
                id.includes('node_modules/ccount') ||
                id.includes('node_modules/escape-string-regexp') ||
                id.includes('node_modules/markdown-table') ||
                id.includes('node_modules/zwitch')) {
              return 'md-vendor';
            }

            // Everything else from node_modules
            return 'utils-vendor';
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
