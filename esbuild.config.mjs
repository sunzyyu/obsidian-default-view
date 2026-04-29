import esbuild from 'esbuild';
import process from 'node:process';

const isProduction = process.argv.includes('production');

const context = await esbuild.context({
  entryPoints: ['src/main.ts'],
  bundle: true,
  outfile: 'main.js',
  external: [
    'obsidian',
    'electron',
    '@codemirror/autocomplete',
    '@codemirror/collab',
    '@codemirror/commands',
    '@codemirror/language',
    '@codemirror/lint',
    '@codemirror/search',
    '@codemirror/state',
    '@codemirror/view',
    '@lezer/common',
    '@lezer/highlight',
    '@lezer/lr',
  ],
  format: 'cjs',
  platform: 'node',
  sourcemap: isProduction ? false : 'inline',
  logLevel: 'info',
  minify: isProduction,
  treeShaking: true,
});

if (isProduction) {
  await context.rebuild();
  await context.dispose();
} else {
  await context.watch();
  console.log('Watching for changes...');
}
