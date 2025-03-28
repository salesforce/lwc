import lwc from '@lwc/rollup-plugin';
import { test, expect } from 'vitest';

test('exposes plugin version', () => {
    const plugin = lwc();
    expect(plugin.version).toMatch(/^\d+\.\d+\.\d+/);
});
