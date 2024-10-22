/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as engineDom from '@lwc/engine-dom';
import * as engineServer from '@lwc/engine-server';
import * as ssrRuntime from '@lwc/ssr-runtime';

describe('isomorphic package exports', () => {
    test('engine-server is a superset of engine-dom', () => {
        const baseExports = new Set(Object.keys(engineDom));
        const superExports = new Set(Object.keys(engineServer));
        for (const exp of superExports) {
            baseExports.delete(exp);
        }
        expect(Array.from(baseExports)).toEqual([
            // Exports that intentionally only exist in @lwc/engine-dom
            '__unstable__ProfilerControl',
            '__unstable__ReportingControl',
            'buildCustomElementConstructor',
            'getComponentConstructor',
            'hydrateComponent',
            'isNodeFromTemplate',
            'rendererFactory',
        ]);
    });

    test('ssr-runtime is a superset of engine-server', () => {
        const baseExports = new Set(Object.keys(engineServer));
        const superExports = new Set(Object.keys(ssrRuntime));
        for (const exp of superExports) {
            baseExports.delete(exp);
        }
        expect(Array.from(baseExports)).toEqual([
            // Exports that intentionally only exist in @lwc/engine-server
            'default', // artifact of interop support
        ]);
    });
});
