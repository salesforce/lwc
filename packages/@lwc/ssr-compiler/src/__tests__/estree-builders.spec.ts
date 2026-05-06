/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, test, expect } from 'vitest';
import { bImportDeclaration } from '../estree/builders';

describe('bImportDeclaration', () => {
    test('produces a named import from a single string', () => {
        const node = bImportDeclaration('foo');
        expect(node.type).toBe('ImportDeclaration');
        expect(node.source).toMatchObject({ type: 'Literal', value: '@lwc/ssr-runtime' });
        expect(node.specifiers).toHaveLength(1);
        expect(node.specifiers[0]).toMatchObject({
            type: 'ImportSpecifier',
            imported: { name: 'foo' },
            local: { name: 'foo' },
        });
    });

    test('produces named imports from an array of strings', () => {
        const node = bImportDeclaration(['foo', 'bar']);
        expect(node.specifiers).toHaveLength(2);
        expect(node.specifiers).toMatchObject([
            { type: 'ImportSpecifier', imported: { name: 'foo' } },
            { type: 'ImportSpecifier', imported: { name: 'bar' } },
        ]);
    });

    test('produces a default import when the key is "default"', () => {
        const node = bImportDeclaration({ default: 'Foo' });
        expect(node.specifiers[0]).toMatchObject({
            type: 'ImportDefaultSpecifier',
            local: { name: 'Foo' },
        });
    });

    test('produces a namespace import when the key is "*"', () => {
        const node = bImportDeclaration({ '*': 'Foo' });
        expect(node.specifiers[0]).toMatchObject({
            type: 'ImportNamespaceSpecifier',
            local: { name: 'Foo' },
        });
    });

    test('produces an aliased named import when a local name is provided', () => {
        const node = bImportDeclaration({ foo: '$foo$' });
        expect(node.specifiers[0]).toMatchObject({
            type: 'ImportSpecifier',
            imported: { name: 'foo' },
            local: { name: '$foo$' },
        });
    });

    test('accepts an explicit source module', () => {
        const node = bImportDeclaration('foo', 'some-other-pkg');
        expect(node.source).toMatchObject({ value: 'some-other-pkg' });
    });
});
