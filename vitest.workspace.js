import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
    'packages/@lwc/shared',
    'packages/@lwc/wire-service',
    'packages/@lwc/style-compiler',
    'packages/@lwc/errors',
    'packages/@lwc/features',
    'packages/@lwc/signals',
]);
