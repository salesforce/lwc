import path from 'path';
import { rollup } from 'rollup';

import lwc from '../../index';

describe('environment', () => {
    it('throws when setting an environment that is not "dom" or "server"', () => {
        expect(() => lwc({ environment: 'native' })).toThrowError(
            'Invalid "environment" option. Received native but expected "dom", "server" or undefined.'
        );
    });

    it('resolves to "@lwc/engine-dom" by default', async () => {
        const resolvedIds = [];

        await rollup({
            input: path.resolve(__dirname, 'fixtures/index.js'),
            plugins: [lwc()],
            external(id, parentId, isResolved) {
                if (isResolved) {
                    resolvedIds.push(id);
                }
            },
        });

        expect(resolvedIds).toHaveLength(1);
        expect(resolvedIds[0]).toMatch(/lwc\/dist\/engine\/esm\/es\d+\/engine.js$/);
    });

    it('resolves to "@lwc/engine-dom" when environment is set to "dom"', async () => {
        const resolvedIds = [];

        await rollup({
            input: path.resolve(__dirname, 'fixtures/index.js'),
            plugins: [
                lwc({
                    environment: 'dom',
                }),
            ],
            external(id, parentId, isResolved) {
                if (isResolved) {
                    resolvedIds.push(id);
                }
            },
        });

        expect(resolvedIds).toHaveLength(1);
        expect(resolvedIds[0]).toMatch(/lwc\/dist\/engine\/esm\/es\d+\/engine.js$/);
    });

    it('resolves to "@lwc/engine-server" when environment is set to "server"', async () => {
        const resolvedIds = [];

        await rollup({
            input: path.resolve(__dirname, 'fixtures/index.js'),
            plugins: [
                lwc({
                    environment: 'server',
                }),
            ],
            external(id, parentId, isResolved) {
                if (isResolved) {
                    resolvedIds.push(id);
                }
            },
        });

        expect(resolvedIds).toHaveLength(1);
        expect(resolvedIds[0]).toMatch(/lwc\/dist\/engine-server\/esm\/es\d+\/engine-server.js$/);
    });
});
