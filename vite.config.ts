import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import vue from '@vitejs/plugin-vue';
import webExtension, { readJsonFile } from 'vite-plugin-web-extension';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import copy from 'rollup-plugin-copy';

const APP_ID = {
  chrome: 'hhfnghjdeddcfegfekjeihfmbjenlomm',
  edge: 'eepmlmdenlkkjieghjmedjahpofieogf',
};
const browser = process.env.TARGET || 'chrome';

function generateManifest() {
  const manifest = readJsonFile('src/manifest.json');
  const pkg = readJsonFile('package.json');
  return {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    ...manifest,
  };
}

// Rollup plugin: rename any output chunk whose filename starts with "_"
// Chrome extensions reject filenames beginning with "_" (reserved by the system).
// We must both rename the file key in the bundle AND patch every reference to it
// inside other chunk's generated code.
function renameUnderscoreChunks() {
  return {
    name: 'rename-underscore-chunks',
    buildStart() {
      // Remove stale _-prefixed JS files left by previous builds.
      // emptyOutDir:false means they persist; Chrome refuses to load them.
      const distDir = path.resolve(__dirname, 'dist');
      if (!fs.existsSync(distDir)) return;
      for (const file of fs.readdirSync(distDir)) {
        if (file.startsWith('_') && file.endsWith('.js')) {
          fs.rmSync(path.join(distDir, file), { force: true });
        }
      }
    },
    generateBundle(_options: unknown, bundle: Record<string, { type: string; fileName: string; code?: string; imports?: string[]; dynamicImports?: string[] }>) {
      // Build a rename map: old fileName -> new fileName
      const renameMap: Record<string, string> = {};
      for (const key of Object.keys(bundle)) {
        const chunk = bundle[key];
        if (chunk.type === 'chunk') {
          const base = chunk.fileName.split('/').pop()!;
          if (base.startsWith('_')) {
            const newBase = 'vue-' + base.replace(/^_+/, '');
            const newFileName = chunk.fileName.replace(base, newBase);
            renameMap[chunk.fileName] = newFileName;
          }
        }
      }

      if (Object.keys(renameMap).length === 0) return;

      // Rename the bundle keys and update fileName on each chunk
      for (const [oldName, newName] of Object.entries(renameMap)) {
        const chunk = bundle[oldName];
        chunk.fileName = newName;
        bundle[newName] = chunk;
        delete bundle[oldName];
      }

      // Patch all import/code references in every chunk
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk') continue;
        if (chunk.imports) {
          chunk.imports = chunk.imports.map((imp: string) => renameMap[imp] ?? imp);
        }
        if (chunk.dynamicImports) {
          chunk.dynamicImports = chunk.dynamicImports.map((imp: string) => renameMap[imp] ?? imp);
        }
        if (chunk.code) {
          for (const [oldName, newName] of Object.entries(renameMap)) {
            // Replace bare filename references (both with and without leading path)
            const oldBase = oldName.split('/').pop()!;
            const newBase = newName.split('/').pop()!;
            chunk.code = chunk.code.split(oldBase).join(newBase);
          }
        }
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    assetsInlineLimit: 1024,
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name].js',
        assetFileNames: assetInfo => {
          let extType = assetInfo.name.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'icons';
          }
          return `assets/${extType}/[name][extname]`;
        },
      },
    },

    emptyOutDir: false,
    sourcemap: mode === 'development' ? 'inline' : false,
    minify: mode === 'development' ? false : true,
  },
  define: {
    'process.env': process.env,
    __EXTENSION_MODE__: JSON.stringify(mode),
    __DEV__: mode === 'development',
    __PROD__: mode === 'production',
    __APP_ID__: JSON.stringify(APP_ID[browser]),
    __BROWSER__: JSON.stringify(browser),
  },
  plugins: [
    vue(),
    VueI18nPlugin({
      include: path.resolve(__dirname, '..', 'src/assets/_locales/*'),
    }),
    webExtension({
      manifest: generateManifest,
      watchFilePaths: ['package.json', 'manifest.json'],
      additionalInputs: ['src/block.html', 'src/welcome.html', 'src/offscreen.html'],
    }),
    copy({
      targets: [
        { src: 'src/_locales', dest: 'dist' },
        { src: 'src/assets/pomodoro-sounds', dest: 'dist/assets' },
      ],
    }),
    renameUnderscoreChunks(),
  ],
  optimizeDeps: {
    include: ['vue', 'webextension-polyfill'],
  },
}));
