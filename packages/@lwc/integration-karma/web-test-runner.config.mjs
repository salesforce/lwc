import path from 'node:path';
import rollupPluginLwc from '@lwc/rollup-plugin';
import { fromRollup } from '@web/dev-server-rollup';
import rollupPluginCommonjs from '@rollup/plugin-commonjs';
import customRollup from './helpers/lwc.mjs';

const lwc = fromRollup(rollupPluginLwc);
void lwc;

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
                }
                try {
                    // If it can be resolved, we don't need to do anything
                    import.meta.resolve(source);
                } catch (_) {
                    // If it can't be resolved, it's probably an LWC component
                    // If we're in a .spec.js file, we know that the relevant components will
                    // be in sibling directories of that file
                    const spec = context.path;
                    if (
                        !spec.endsWith('.spec.js') ||
                        source.startsWith('./') ||
                        source.startsWith('../')
                    ) {
                        // throw new Error(`Cannot resolve import "${source}" (loaded from ${spec}).`);
                    }
                    const sourceParts = source.split('/');
                    if (sourceParts.length === 1) {
                        // throw new Error('TODO: non-component');
                    } else if (sourceParts.length === 2) {
                        const [ns, cmp] = sourceParts;
                        const resolved = path.join(path.dirname(spec), ns, cmp, `${cmp}.js`);
                        return resolved + '?lwc=1';
                    } else {
                        // throw new Error(
                        //     `Cannot resolve import with subpath "${source}" (loaded from ${spec}).`
                        // );
                    }
                }
            },
            async serve(ctx) {
                if (ctx.query.lwc) {
                    return customRollup(ctx);
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
                },
            };
            </script>
            <script type="module" src="./helpers/setup.mjs"></script>
            <script type="module" src="./helpers/wtr-utils.mjs"></script>
            <script type="module" src="${testFramework}"></script>
          </body>
        </html>`,
};
