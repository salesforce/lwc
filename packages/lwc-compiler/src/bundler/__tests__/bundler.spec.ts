import { bundle } from '../bundler';
import { normalizeOptions } from '../../compiler/options';

describe('bundler', () => {
    test('throws when invoked without configurations', async () => {
        await expect(bundle()).rejects.toMatchObject({
            message: expect.stringContaining(
                'Expected options object, received "undefined".',
            ),
        });
    });

    test('does not return sourcemap by default', async () => {
        const result = await bundle(normalizeOptions({
            name: 'cmp',
            namespace: 'c',
            files: {
                'cmp.js': 'let a = 1'
            }
        }));

        expect(result.map).toBeNull();
    });

    test('returns sourcemap when requested', async () => {
        const result = await bundle(normalizeOptions({
            name: 'cmp',
            namespace: 'c',
            files: {
                'cmp.js': 'const a = 1;'
            },
            outputConfig: {
                sourcemap: true
            }
        }));

        expect(result.map).not.toBeNull();
    });
});
