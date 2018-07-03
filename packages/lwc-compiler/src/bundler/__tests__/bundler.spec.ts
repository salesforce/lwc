import { bundle } from '../bundler';

describe('bundler', () => {
    test('throws when invoked without configurations', async () => {
        await expect(bundle()).rejects.toMatchObject({
            message: expect.stringContaining(
                'Expected options object, received "undefined".',
            ),
        });
    });
});
