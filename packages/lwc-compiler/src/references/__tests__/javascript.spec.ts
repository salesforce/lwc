import { getReferences } from '../../references/javascript';

describe('resource-url', () => {
    test('gather metadata', () => {
        expect(
            getReferences(
                `import resource from '@resource-url/foo';`,
                'test.js',
            ),
        ).toEqual([
            {
                id: 'foo',
                file: 'test.js',
                type: 'resourceUrl',
                locations: [
                    {
                        start: 36,
                        length: 3,
                    },
                ],
            },
        ]);
    });

    test('errors when using namespaced import', () => {
        expect(() =>
            getReferences(
                `import * as resource from '@resource-url/foo';`,
                'test.js',
            ),
        ).toThrow('@resource-url modules only support default imports.');
    });

    test('errors when using a named import', () => {
        expect(() =>
            getReferences(
                `import { resource } from '@resource-url/foo';`,
                'test.js',
            ),
        ).toThrow('@resource-url modules only support default imports.');
    });
});

describe('label', () => {
    test('gather metadata', () => {
        expect(
            getReferences(`import label from '@label/foo';`, 'test.js'),
        ).toEqual([
            {
                id: 'foo',
                file: 'test.js',
                type: 'label',
                locations: [
                    {
                        start: 26,
                        length: 3,
                    },
                ],
            },
        ]);
    });

    test('errors when using namespaced import', () => {
        expect(() =>
            getReferences(`import * as label from '@label/foo';`, 'test.js'),
        ).toThrow('@label modules only support default imports.');
    });

    test('errors when using a named import', () => {
        expect(() =>
            getReferences(`import { label } from '@label/foo';`, 'test.js'),
        ).toThrow('@label modules only support default imports.');
    });
});

describe('apex', () => {
    test('gather metadata', () => {
        expect(
            getReferences(
                `import methodA from '@apex/MyClass.methodA';`,
                'test.js',
            ),
        ).toEqual([
            {
                id: 'MyClass.methodA',
                file: 'test.js',
                type: 'apexMethod',
                locations: [
                    {
                        start: 27,
                        length: 15,
                    },
                ],
            },
        ]);
    });

    test('errors when using namespaced import', () => {
        expect(() =>
            getReferences(
                `import * as MyClass from '@apex/MyClass';`,
                'test.js',
            ),
        ).toThrow('@apex modules only support default imports.');
    });

    test('errors when using a default import', () => {
        expect(() =>
            getReferences(
                `import { methodA } from '@apex/MyClass';`,
                'test.js',
            ),
        ).toThrow('@apex modules only support default imports.');
    });
});
