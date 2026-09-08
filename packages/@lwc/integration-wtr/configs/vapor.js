import * as options from '../helpers/options.js';
import createConfig from './shared/base-config.js';
import vaporTestPlugin from './plugins/serve-vapor.js';

// The helper modules (helpers/*.js) are served NATIVELY (the serve-vapor plugin
// marks them `external`, so they are not bundled into each spec). Their bare
// `import { ... } from 'lwc'` resolves via WTR's nodeResolve to the regular
// engine-dom `lwc` package. For most calls that's harmless (the vapor runtime
// ignores them), but `helpers/signals.js` calls `setTrustedSignalSet`, which
// must reach the VAPOR runtime: vapor reads the trusted-signal set from a
// `globalThis` key (it bundles separately from these native helpers). Routing
// that call to engine-dom published the set to the wrong runtime, so vapor's
// `isTrustedSignalValue` was always false and the signal protocol never
// subscribed. Redirect the bare `lwc` specifier (for native helpers ONLY) to a
// tiny shim that re-exports engine-dom but overrides `setTrustedSignalSet` to
// publish onto vapor's global key. NOTE: this is deliberately a lightweight
// shim, NOT the full vapor bundle — serving the whole runtime natively (a 2nd
// runtime instance alongside the bundled spec) hangs page load.
const vaporLwcResolver = {
    name: 'vapor-lwc-native-resolver',
    resolveImport({ source }) {
        if (source === 'lwc') {
            return '/helpers/lwc-vapor-shim.js';
        }
    },
};

// Vapor supports both shadow modes. Default is native shadow; set
// VAPOR_SYNTHETIC_SHADOW=1 to load the synthetic-shadow polyfill (the base config
// injects `@lwc/synthetic-shadow` when NATIVE_SHADOW is false).
const SYNTHETIC = Boolean(process.env.VAPOR_SYNTHETIC_SHADOW);
const baseConfig = createConfig({
    ...options,
    NATIVE_SHADOW: !SYNTHETIC,
});

// By default we run the curated `test-vapor/` suite (the set known to pass under
// vapor). Set VAPOR_FULL_SUITE=1 to instead run the *entire* existing WTR
// integration suite (`test/**`) under vapor — a conformance probe that reports
// how many of the standard integration specs vapor can satisfy today.
const FULL_SUITE = Boolean(process.env.VAPOR_FULL_SUITE);

/** @type {import("@web/test-runner").TestRunnerConfig} */
export default {
    ...baseConfig,
    files: FULL_SUITE ? ['test/**/*.spec.js'] : ['test-vapor/**/*.spec.js'],
    plugins: [vaporLwcResolver, ...baseConfig.plugins, vaporTestPlugin],
    // Coverage thresholds are not enforced for the (growing) vapor suite yet.
    coverage: false,
    // Bound each test so an unexpected infinite loop fails that one test instead
    // of stalling the whole runner (which previously masked the suite total).
    testFramework: {
        ...baseConfig.testFramework,
        config: { ...(baseConfig.testFramework?.config ?? {}), timeout: 5000 },
    },
};
