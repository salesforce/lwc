/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { fileURLToPath } from 'node:url';

// `@best/cli` ALWAYS tries to persist a run's snapshots via `apiDatabase` at the end of
// `best src` — even for a local run. In CI, `BEST_FRONTEND_HOSTNAME` points that at the
// results frontend. Locally those env vars are unset, so the default `rest/frontend`
// adapter would build `new URL("undefined/api/v1/...")` and throw `TypeError: Invalid URL`,
// killing the run after the benchmarks have already finished. When the frontend host is
// not configured, fall back to a committed no-op adapter (referenced by absolute path so
// `@best/api-db`'s `req()`/`require()` resolves it) which simply discards the snapshots.
const hasFrontendDb = Boolean(process.env.BEST_FRONTEND_HOSTNAME);
const apiDatabase = hasFrontendDb
    ? {
          adapter: 'rest/frontend',
          uri: process.env.BEST_FRONTEND_HOSTNAME,
          token: process.env.BEST_FRONTEND_CLIENT_TOKEN,
      }
    : {
          adapter: fileURLToPath(new URL('./scripts/noop-db-adapter.cjs', import.meta.url)),
      };

// The engine to benchmark. Benchmark sources import `createElement` from `@lwc/engine-dom` and
// their components from `@lwc/perf-benchmarks-components/dist/dom/...`. `@best` bundles each
// benchmark's SOURCE with the `plugins` below (it does NOT read the benchmark `dist/`), so to run
// the SAME benchmarks against Vapor we rewrite those two import specifiers at bundle time to point
// at `@lwc/engine-vapor` and the `dist/vapor/` component output. Selected via `PERF_ENGINE=vapor`.
// The default (`dom`, or unset) leaves the classic DOM engine imports untouched.
const perfEngine = process.env.PERF_ENGINE ?? 'dom';
const isVapor = perfEngine === 'vapor';

// Use a distinct project name per engine so the two runs write to separate result folders
// (`__benchmarks_results__/<projectName>/<benchmark>_<sha>/`) instead of colliding on the same SHA.
const projectName = isVapor ? 'lwc-vapor' : 'lwc';

// When benchmarking Vapor, rewrite the engine + component-dist import specifiers. `delimiters:
// ['', '']` does a raw substring replace (same technique the components rollup uses for `from 'lwc'`).
const vaporImportRewritePlugin = isVapor
    ? [
          '@rollup/plugin-replace',
          {
              preventAssignment: true,
              delimiters: ['', ''],
              values: {
                  "from '@lwc/engine-dom'": "from '@lwc/engine-vapor'",
                  'from "@lwc/engine-dom"': 'from "@lwc/engine-vapor"',
                  '@lwc/perf-benchmarks-components/dist/dom/':
                      '@lwc/perf-benchmarks-components/dist/vapor/',
              },
          },
      ]
    : null;

// Benchmarks that cannot run under Vapor yet, skipped for the vapor run only (kept for classic).
// Two distinct kinds of gap:
//
//   COMPILE gaps (no `dist/vapor/` output — would fail bundling with UNRESOLVED_IMPORT; keep in
//   sync with the vapor exclusions in the components rollup):
//     - expression: template uses a ternary wrapping a template literal, which the vapor template
//       compiler currently emits as unparseable output ("Unexpected token `)`. Expected `}`").
//
//   RUNTIME gaps (compile fine, but throw when the benchmark interacts with them — excluded so the
//   whole vapor pass can complete and persist results, since `best` aborts + discards ALL in-memory
//   measurements on the first benchmark error):
//     - (none currently) — remove-row-1k / select-row-1k dispatch a row click handled by
//       `handleRowClick`, which reads `currentTarget.dataset`. Vapor's delegated event handler now
//       exposes `currentTarget` as the delegating element (see engine-vapor/src/dom/event.ts
//       `delegatedEventHandler`), matching classic, so both benchmarks run under vapor.
const VAPOR_UNSUPPORTED_BENCHMARK_PATTERNS = [
    // compile gap
    '**/expression.benchmark.js',
];

const testPathIgnorePatterns = [
    // `@best`'s own defaults (see `@best/config` defaults.js) — must be repeated since we override.
    '**/__benchmarks_results__/**',
    '**/node_modules/**',
    '**/__tests__/**',
    // Best writes its bundled artifacts under `dist/__benchmarks__/` (`.benchmark.js` +
    // `.html` + `.tachometer.json`). Those are ALREADY-bundled outputs — if a later run's
    // path filter matches them (e.g. a `js-framework-benchmark` substring matches both the
    // `src/.../js-framework-benchmark/` sources AND the `dist/.../js-framework-benchmark/`
    // copies), Best tries to re-bundle them and Rollup throws "Identifier 'benchmark' has
    // already been declared". Never scan our own bundle output — only the `src/` sources.
    '**/dist/**',
    ...(isVapor ? VAPOR_UNSUPPORTED_BENCHMARK_PATTERNS : []),
];

export default {
    projectName,
    mainBranch: 'master',
    testPathIgnorePatterns,
    // This number is a tradeoff: higher = less variance, lower = less time spent running in CI
    benchmarkIterations: 60,
    // Refresh the browser between each iteration. This doesn't affect our benchmarks much
    // (since they already use for-loops, so we're only measuring peak performance, i.e. JITed performance),
    // but our tests assume that the DOM is fresh on each iteration
    benchmarkOnClient: false,
    // We only care about JS execution time, not style/layout/paint, or aggregate. We don't care about
    // the style/layout costs of the components that we're putting in the DOM; just how long LWC takes
    // to insert them into the DOM. Setting this to just 'script' also skips running an extra macro task:
    // https://github.com/salesforce/best/commit/6190687cce0559f1ed7678d70763c911a0f96610
    metrics: ['script'],
    plugins: [
        // Rewrite engine/component imports to Vapor when PERF_ENGINE=vapor (no-op otherwise). Runs
        // as a transform before Rollup parses this module's imports, so node-resolve then resolves
        // the rewritten `@lwc/engine-vapor` specifier.
        ...(vaporImportRewritePlugin ? [vaporImportRewritePlugin] : []),
        '@rollup/plugin-node-resolve',
        [
            '@rollup/plugin-replace',
            {
                values: {
                    // Run perf tests in prod mode, same as in Tachometer
                    'process.env.NODE_ENV': '"production"',
                },
                preventAssignment: true,
            },
        ],
    ],
    // This version should be updated when the Best infra updates, once per release
    specs: { name: 'chrome.headless', version: 'latest' },
    apiDatabase,
    runners: [
        {
            alias: 'default',
            runner: '@best/runner-headless',
            config: {
                launchOptions: {
                    headless: 'new', // Use Chrome's new headless mode
                },
            },
        },
        {
            runner: '@best/runner-remote',
            alias: 'remote',
            config: {
                uri: process.env.BEST_HUB_HOSTNAME,
                options: {
                    authToken: process.env.BEST_HUB_CLIENT_TOKEN,
                },
                launchOptions: {
                    headless: 'new', // Use Chrome's new headless mode
                },
            },
        },
    ],
};
