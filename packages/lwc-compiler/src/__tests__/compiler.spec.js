import { compile } from '../compiler';
import { pretify, readFixture } from './utils';
const HEALTHY_CONFIG = {
    sources: {
        '/x/foo/foo.js': readFixture(
            'class_and_template/class_and_template.js',
        ),
        '/x/foo/foo.html': readFixture(
            'class_and_template/class_and_template.html',
        ),
    },
    entry: '/x/foo/foo.js',
    moduleName: 'foo',
    moduleNamespace: 'x',
    mapNamespaceFromPath: true,
    format: 'es',
    mode: 'dev',
    env: {},
};

describe('compiler test', () => {
    test('should return status, references, diagnostics, code, mode', async () => {
        const result = await compile(HEALTHY_CONFIG.entry, HEALTHY_CONFIG);
        const {
            status,
            mode,
            references,
            diagnostics,
            code,
        } = result;

        expect(status).not.toBeUndefined();
        expect(mode).not.toBeUndefined();
        expect(references).not.toBeUndefined();
        expect(diagnostics).not.toBeUndefined();
        expect(code).not.toBeUndefined();
    });

    test('should return reference object for valid source', async () => {
        const refSources = {
            sources: {
                '/x/foo/foo.js': `import resource from '@resource-url/foo';`,
            }
        };
        const config = {...HEALTHY_CONFIG, ...refSources};
        const result = await compile(HEALTHY_CONFIG.entry, config);
        const { references } = result;
        expect(references).toBeDefined();
        expect(references[0]).toMatchObject(            {
            id: 'foo',
            file: '/x/foo/foo.js',
            type: 'resourceUrl',
            locations: [
                {
                    start: 36,
                    length: 3,
                },
            ],
        });
    });
    test('compilation should not contain bundle properties if reference gathering encountered an error', async () => {
        const refSources = {
            sources: {
                'test.js': `import * as MyClass from '@apex/MyClass';`
            }
        }
        const config = {...HEALTHY_CONFIG, ...refSources};
        const result = await compile(HEALTHY_CONFIG.entry, config);
        const { code, diagnostics, status } = result;

        expect(status).toBe('error');
        expect(diagnostics[0].level).toBe(0); // fatal
        expect(code).toBeUndefined();
    });
});
