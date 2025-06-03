import { LWC_VERSION } from '@lwc/shared';
import customRollup from './helpers/lwc.mjs';

/** @type {import("@web/test-runner").TestRunnerConfig} */
export default {
    files: ['test/**/*.spec.js'],
    nodeResolve: true,
    rootDir: import.meta.dirname,
    plugins: [
        {
            resolveImport({ source }) {
                if (source === 'test-utils') {
                    return '/helpers/wtr-utils.mjs';
                } else if (source === 'wire-service') {
                    return '@lwc/wire-service';
                }
            },
            async serve(ctx) {
                if (ctx.path.endsWith('.spec.js')) {
                    return await customRollup(ctx);
                }
            },
        },
    ],
    testRunnerHtml: (testFramework) =>
        `<!DOCTYPE html>
        <html>
          <body>
            <script type="module">
            globalThis.process = {
                env: {
                    NODE_ENV: 'test-karma-lwc',
                    LWC_VERSION: '${LWC_VERSION}'
                },
            };
            </script>
            <script type="module" src="./helpers/setup.mjs"></script>
            <script type="module" src="./helpers/wtr-utils.mjs"></script>
            <script type="module" src="${testFramework}"></script>
          </body>
        </html>`,
};
