// This config is used when running `server.js`.

import lwc from '@lwc/rollup-plugin';
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';
import simpleRollupConfig from'./rollup.config.js';

const ENV = process.env.NODE_ENV ?? 'development';


export default [
    // Client-only build.
    simpleRollupConfig({ watch: false }),

    // Client build to rehydrate after SSR.
    {
        input: 'src/entry-client-ssr.js',
        output: {
          file: 'dist/entry-rehydrate.js',
          format: 'cjs'
        },
        plugins: [
          lwc(),
          replace({
            'process.env.NODE_ENV': JSON.stringify(ENV),
            preventAssignment: true,
          }),
        ],
        watch: {
          exclude: ["node_modules/**"]
        }
      },

    // Component code only, for import during server-side rendering.
    {
        input: 'src/app.js',
        output: {
          file: 'dist/app.js',
          format: 'esm',
        },
        external: [
          /node_modules/,
          '@lwc/engine-server',
        ],
        plugins: [
          alias({
            entries: [{
              find: 'lwc',
              replacement: '@lwc/engine-server',
            }],
          }),
          replace({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            preventAssignment: true,
          }),
          lwc(),
        ].filter(Boolean),
        watch: {
          exclude: ["node_modules/**"]
        }
      },
];
