import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
    'packages/@lwc/shared',
    'packages/@lwc/wire-service',
    'packages/@lwc/style-compiler',
    'packages/@lwc/errors',
    'packages/@lwc/features',
    'packages/@lwc/signals',
    'packages/@lwc/rollup-plugin',
    'packages/@lwc/engine-core',
    'packages/@lwc/engine-dom',
    'packages/@lwc/compiler',
    'packages/@lwc/babel-plugin-component',
]);
