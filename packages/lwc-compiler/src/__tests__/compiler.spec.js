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
    test('should return status, references, diagnostics, code, mode, format', async () => {
        const result = await compile(HEALTHY_CONFIG.entry, HEALTHY_CONFIG);
        const {
            status,
            mode,
            references,
            diagnostics,
            code,
            format,
        } = result;

        expect(code).toBeDefined();
        expect(diagnostics).toBeDefined();
        expect(format).toBeDefined();
        expect(mode).toBeDefined();
        expect(references).toBeDefined();
        expect(status).toBeDefined();
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
    test('diagnostics returns bundler specific error when format is misconfigured', async () => {
        const refSources = {
            sources: {
                '/x/foo/foo.js': `import resource from '@resource-url/foo';`,
            }
        };
        const config = {...HEALTHY_CONFIG, ...refSources, ...{ format: 'bad' }};
        const result = await compile(HEALTHY_CONFIG.entry, config);
        const { code, diagnostics, status } = result;
        expect(code).toBeUndefined();
        expect(status).toBe('error');
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].message).toBe("Invalid format: bad - valid options are amd, cjs, es, iife, umd");
    });
});
