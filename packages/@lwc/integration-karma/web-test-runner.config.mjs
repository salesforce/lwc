import path from 'node:path';
import { fromRollup } from '@web/dev-server-rollup';
import rollupPluginCommonjs from '@rollup/plugin-commonjs';
import { LWC_VERSION } from '@lwc/shared';
import customRollup from './helpers/lwc.mjs';

/** @type {import("@web/test-runner").TestRunnerConfig} */
export default {
    files: ['test/**/*.spec.js'],
    nodeResolve: true,
    rootDir: import.meta.dirname,
    plugins: [
        {
            resolveImport({ source, context }) {
                if (source === 'test-utils') {
                    return '/helpers/wtr-utils.mjs';
                } else if (source === 'wire-service') {
                    return '@lwc/wire-service';
                }
                try {
                    // If it can be resolved, we don't need to do anything
                    import.meta.resolve(source);
                } catch (_) {
                    // If it can't be resolved, it's probably an LWC component
                    const file = context.path;
                    const sourceParts = source.split('/');
                    if (sourceParts.length === 2) {
                        // If we're in a .spec.js file, we know that the relevant components will
                        // be in sibling directories of that file
                        const [ns, cmp] = sourceParts;
                        if (file.endsWith('.spec.js')) {
                            const resolved = path.join(path.dirname(file), ns, cmp, `${cmp}`);
                            return resolved + '?lwc=1';
                        } else {
                            // Otherwise we're in another component, e.g. importing x/foo from x/bar
                            const fileParts = file.split(path.sep);
                            const nsIndex = fileParts.indexOf(ns);
                            if (nsIndex === -1) {
                                throw new Error('Unimplemented: cross-namespace components');
                            }
                            const resolved = path.join(
                                ...fileParts.slice(0, nsIndex + 1),
                                cmp,
                                `${cmp}`
                            );
                            return `/${resolved}?lwc=1`;
                        }
                    }
                }
            },
            async serve(ctx) {
                if (ctx.query.lwc) {
                    return {
                        body: await customRollup(ctx),
                        type: 'application/javascript',
                    };
                }
            },
        },
        fromRollup(rollupPluginCommonjs)({}),
    ],
    testRunnerHtml: (testFramework) =>
        `<!DOCTYPE html>
        <html>
          <body>
            <script> // not type=module so that it's executed before anything else loads
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
