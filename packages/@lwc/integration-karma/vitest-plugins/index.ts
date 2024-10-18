import config from './config';
import transformFramework from './transform-framework';
import hydrationTests from './hydration-tests';
import lwc from './lwc';
import type { Plugin } from 'vitest/config';

export default function vitestPlugins(mode: 'test' | 'test-hydration'): Plugin[] {
    return [config(), transformFramework(), mode === 'test-hydration' ? hydrationTests() : lwc()];
}
