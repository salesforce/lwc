import process from 'node:process';
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
    'packages/@lwc/babel-plugin-component',
    'packages/@lwc/compiler',
    'packages/@lwc/engine-core',
    'packages/@lwc/engine-dom',
    'packages/@lwc/engine-server',
    'packages/@lwc/errors',
    'packages/@lwc/features',
    'packages/@lwc/module-resolver',
    'packages/@lwc/rollup-plugin',
    'packages/@lwc/shared',
    'packages/@lwc/signals',
    // We will enable this for realsies once all the tests are passing, but for now having the env var avoids
    // running these tests in CI while still allowing for local testing.
    ...(process.env.TEST_SSR_COMPILER ? ['packages/@lwc/ssr-compiler'] : []),
    'packages/@lwc/ssr-runtime',
    'packages/@lwc/style-compiler',
    'packages/@lwc/template-compiler',
    'packages/@lwc/wire-service',
    'packages/lwc',
]);
