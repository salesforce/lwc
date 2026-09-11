import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rollup } from 'rollup';
import lwcRollupPlugin from '@lwc/rollup-plugin';

import { API_VERSION } from '../../helpers/options.js';

/**
 * Serve plugin for **vapor mode**. It mirrors `serve-integration.js`, with two
 * differences:
 *
 *   1. The LWC rollup plugin is configured with `enableVaporCompilation: true`,
 *      so templates compile to the VDOM-less vapor output.
 *   2. The bare `lwc` specifier resolves to the vapor `lwc` facade
 *      (`@lwc/engine-vapor/src/lwc-facade`) rather than `@lwc/engine-dom`, and
 *      `@lwc/engine-vapor` resolves to the vapor runtime. Both are bundled in
 *      (not external) so the served spec is self-contained.
 */

// Resolve to the built bundle (dist/index.js), which contains both the vapor
// runtime helpers (template/renderEffect/setText/...) and the `lwc` facade
// (LightningElement/createElement/registerComponent/...). A single bundle keeps
// module identity consistent so the facade and the compiled templates share the
// same runtime singletons (current-instance, reactivity maps, delegated events).
const VAPOR_BUNDLE = fileURLToPath(new URL('../../../engine-vapor/dist/index.js', import.meta.url));
// A spy-wrapped `lwc` mock (like the base config's mocks/lwc.js) — used ONLY for
// the sanitizeAttribute spec, which drives the `sanitizeAttribute` export as a
// vitest spy. Re-exports the vapor bundle + overrides sanitizeAttribute with a spy.
const VAPOR_SANITIZE_MOCK = fileURLToPath(new URL('../../mocks/lwc-vapor.js', import.meta.url));
// The vapor bundle imports @lwc/shared (ARIA maps, reflective-property set, etc.);
// resolve it to its built ESM so rollup inlines it into the served spec.
const LWC_SHARED = fileURLToPath(new URL('../../../shared/dist/index.js', import.meta.url));
const LWC_FEATURES = fileURLToPath(new URL('../../../features/dist/index.js', import.meta.url));

// Per-file LWC compiler config override directive: `/*!WTR {...json...}*/`.
const configDirective = /(?:\/\*|<!--)\s*!WTR\s*(.*?)(?:\*\/|-->)/s;

const createRollupPlugin = (input, options) => {
    // TODO [#3370]: remove experimental template expression flag. Enabled for the
    // template-expressions suite (matching serve-integration.js).
    const experimentalComplexExpressions = path.dirname(input).includes('template-expressions');
    return lwcRollupPlugin({
        sourcemap: true,
        enableVaporCompilation: true,
        enableDynamicComponents: true,
        enableLwcOn: true,
        experimentalComplexExpressions,
        // Rewrite runtime dynamic imports (`import('x-ctor')`) through the test
        // dynamic-loader shim (registerForLoad), exactly as serve-integration
        // does. Without this the import is unresolvable, the bundle throws, and
        // the whole spec file hangs the runner.
        dynamicImports: {
            loader: fileURLToPath(new URL('../../helpers/dynamic-loader', import.meta.url)),
            strict: true,
        },
        apiVersion: API_VERSION,
        modules: [{ dir: path.resolve(input, '../../..') }],
        ...options,
    });
};

const VIRTUAL_FLAG_PREFIX = '\0feature-flag:';

/** Resolve/load `@salesforce/featureFlag/*` virtual modules → a boolean export. */
const featureFlagResolver = {
    name: 'feature-flag-virtual',
    resolveId(source) {
        if (!source || !source.startsWith('@salesforce/featureFlag/')) return;
        return `${VIRTUAL_FLAG_PREFIX}${source}`;
    },
    load(id) {
        if (!id || !id.startsWith(VIRTUAL_FLAG_PREFIX)) return;
        const flagName = id.slice(VIRTUAL_FLAG_PREFIX.length).split('/').pop();
        const flags = { TEST_FLAG_ENABLED: true, TEST_FLAG_DISABLED: false };
        return `export default ${flags[flagName] ?? false};`;
    },
};

/**
 * Resolve `lwc` and `@lwc/engine-vapor` to the built vapor bundle. For the
 * sanitizeAttribute spec, the bare `lwc` import (from the SPEC only, not from the
 * mock itself) resolves to a spy-wrapped mock so `sanitizeAttribute.mockReset()`
 * works — mirroring the base config's `mocks/lwc.js` injection.
 */
const makeVaporResolver = (input) => {
    const isSanitizeSpec = input.includes('sanitizeAttribute');
    return {
        name: 'vapor-module-resolver',
        resolveId(source, importer) {
            if (source === '@lwc/engine-vapor') return VAPOR_BUNDLE;
            if (source === 'lwc') {
                // Route the SPEC's `lwc` import to the spy mock; the mock's own
                // `@lwc/engine-vapor` import (and everything else) → the bundle.
                if (isSanitizeSpec && importer && !importer.includes('lwc-vapor.js')) {
                    return VAPOR_SANITIZE_MOCK;
                }
                return VAPOR_BUNDLE;
            }
            if (source === '@lwc/shared') return LWC_SHARED;
            if (source === '@lwc/features') return LWC_FEATURES;
            return null;
        },
    };
};

const transform = async (ctx) => {
    const input = ctx.path.slice(1);
    const defaultRollupPlugin = createRollupPlugin(input);

    // Per-file LWC config override via a `/*!WTR {...}*/` directive (e.g.
    // `componentFeatureFlagModulePath`). The spec entrypoint's directive becomes the
    // default config for the whole bundle. Mirrors serve-integration.js.
    let rootConfig = null;
    const parseConfig = (src, id) => {
        const configStr = src.match(configDirective)?.[1];
        if (!configStr) return rootConfig;
        const config = JSON.parse(configStr);
        if (id.endsWith(`/${input}`)) rootConfig = config;
        return config;
    };
    const perFileLwcPlugin = {
        ...defaultRollupPlugin,
        transform(src, id) {
            const config = parseConfig(src, id);
            const { transform } = config ? createRollupPlugin(input, config) : defaultRollupPlugin;
            return transform.call(this, src, id);
        },
    };

    const bundle = await rollup({
        input,
        // Note: caching disabled while iterating so rebuilt dist artifacts are
        // always picked up.
        plugins: [makeVaporResolver(input), featureFlagResolver, perFileLwcPlugin],
        external: ['@vitest/expect', '@vitest/spy', /\/helpers\/\w+\.js$/],
        onwarn(warning, warn) {
            if (warning.plugin !== 'rollup-plugin-lwc-compiler') {
                warn(warning);
            }
        },
    });

    const { output } = await bundle.generate({
        format: 'esm',
        sourcemap: 'inline',
    });

    return output[0].code;
};

/** @type {import('@web/dev-server-core').Plugin} */
export default {
    name: 'lwc-vapor-plugin',
    async serve(ctx) {
        if (ctx.path.endsWith('.spec.js')) {
            return await transform(ctx);
        } else if (ctx.path === '/test_api_sanitizeAttribute') {
            // The test in /test/api/sanitizeAttribute renders <use href="/test_api_sanitizeAttribute?foo">,
            // which the browser tries to fetch. Serve an empty 200 response so it
            // doesn't 404 (mirrors serve-integration.js). The value doesn't matter;
            // this only avoids the "🚧 404 network requests" reporter noise.
            return '';
        }
    },
};
