import { describe, expect, test } from 'vitest';
import * as runtime from '../index';
import * as stubs from '../stubs';

describe('no stubs are unused', () => {
    test.for(Object.entries(stubs))('%s is used', ([key, value]) => {
        expect(runtime).toHaveProperty(key);
        expect(runtime[key as keyof typeof runtime]).toBe(value);
    });
});
