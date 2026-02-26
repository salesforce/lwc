/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, expect, test } from 'vitest';
import { transformSync } from '@babel/core';
import plugin, { LwcReversePrivateMethodTransform } from '../index';

const BASE_OPTS = {
    namespace: 'lwc',
    name: 'test',
};

const BASE_CONFIG = {
    babelrc: false,
    configFile: false,
    filename: 'test.js',
    compact: false,
};

function transformWithFullPipeline(source: string, opts = {}) {
    return transformSync(source, {
        ...BASE_CONFIG,
        plugins: [[plugin, { ...BASE_OPTS, ...opts }], LwcReversePrivateMethodTransform],
    });
}

describe('private method transform validation', () => {
    test('normal private methods round-trip successfully', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #privateMethod() {
                    return 42;
                }
            }
        `;

        const result = transformWithFullPipeline(source);
        expect(result!.code).toContain('#privateMethod');
        expect(result!.code).not.toContain('__lwc_component_class_internal_private_');
    });

    test('multiple private methods round-trip successfully', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #methodA() { return 1; }
                #methodB() { return 2; }
                #methodC() { return 3; }
            }
        `;

        const result = transformWithFullPipeline(source);
        expect(result!.code).toContain('#methodA');
        expect(result!.code).toContain('#methodB');
        expect(result!.code).toContain('#methodC');
    });

    test('throws error when user-defined method collides with reserved prefix', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                __lwc_component_class_internal_private_sneakyMethod() {
                    return 'collision';
                }
            }
        `;

        expect(() => transformWithFullPipeline(source)).toThrowError(
            /conflicts with internal naming conventions\. Please rename this function to avoid conflict/
        );
    });

    test('throws error when collision exists alongside real private methods', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #realPrivate() { return 1; }
                __lwc_component_class_internal_private_fakePrivate() {
                    return 'collision';
                }
            }
        `;

        expect(() => transformWithFullPipeline(source)).toThrowError(
            /conflicts with internal naming conventions\. Please rename this function to avoid conflict/
        );
    });

    test('does not flag methods that do not use the reserved prefix', () => {
        const source = `
            import { LightningElement } from 'lwc';
            export default class Test extends LightningElement {
                #privateMethod() { return 1; }
                normalPublicMethod() { return 2; }
                _underscoreMethod() { return 3; }
            }
        `;

        const result = transformWithFullPipeline(source);
        expect(result!.code).toContain('#privateMethod');
        expect(result!.code).toContain('normalPublicMethod');
        expect(result!.code).toContain('_underscoreMethod');
    });
});
