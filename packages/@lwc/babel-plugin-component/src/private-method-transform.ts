/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { PRIVATE_METHOD_PREFIX } from './constants';
import type { BabelAPI, LwcBabelPluginPass } from './types';
import type { NodePath, Visitor } from '@babel/core';
import type { types } from '@babel/core';

/**
 * Transforms private method identifiers from #privateMethod to __lwc_component_class_internal_private_privateMethod
 * This function returns a Program visitor that transforms private methods before other plugins process them
 *
 *
 * CURRENTLY SUPPORTED:
 * - Basic private methods: #methodName()
 * - Static private methods: static #methodName()
 * - Async private methods: async #methodName()
 * - Method parameters: #method(param1, param2)
 * - Method body: #method() { return this.value; }
 * - Static methods: static #method()
 *
 * EDGE CASES & MISSING SUPPORT:
 *
 * 1. Private Methods with Decorators ❌
 *    @api #method() { }  // Should error gracefully
 *    @track #method() { }  // Should error gracefully
 *    @wire #method() { }  // This should be error as well ?
 *
 * 2. Private Methods in Nested Classes ❌
 *    class Outer { #outerMethod() { } class Inner { #innerMethod() { } } }
 *    - probably supported, need to be tested
 *
 * 3. Private Methods with Rest/Spread ⚠️
 *    #method(...args) { }        // Rest parameters
 *    #method(a, ...rest) { }     // Mixed parameters
 *    - needs to be tested
 *
 * 4. Private Methods with Default Parameters ⚠️
 *    #method(param = 'default') { }
 *    #method(param = this.value) { }  // `this` reference
 *    - needs to be tested
 *
 * 5. Private Methods with Destructuring ⚠️
 *    #method({ a, b }) { }           // Object destructuring
 *    #method([first, ...rest]) { }   // Array destructuring
 *    - needs to be tested
 *
 * 6. Private Methods in Arrow Functions ❌
 *     class MyClass { #method = () => { }; }
 *    - needs to be tested
 *
 */
export default function privateMethodTransform({
    types: t,
}: BabelAPI): Visitor<LwcBabelPluginPass> {
    return {
        Program: {
            enter(path: NodePath<types.Program>) {
                // Transform private methods BEFORE any other plugin processes them
                path.traverse({
                    // We also need to ensure that there exists no decorator that exposes this method publicly
                    // ex: @api, @track etc.
                    ClassPrivateMethod(path: NodePath<types.ClassPrivateMethod>) {
                        const key = path.get('key');

                        // kind: 'method' | 'get' | 'set' - only 'method' is in scope.
                        if (key.isPrivateName() && path.node.kind === 'method') {
                            const privateName = key.node.id.name;
                            const transformedName = `${PRIVATE_METHOD_PREFIX}${privateName}`;

                            // Create a new ClassMethod node to replace the ClassPrivateMethod
                            const classMethod = t.classMethod(
                                'method', // kind: 'method' | 'get' | 'set'
                                t.identifier(transformedName), // key
                                path.node.params,
                                path.node.body,
                                path.node.computed,
                                path.node.static,
                                path.node.generator,
                                path.node.async
                            );

                            // Replace the entire ClassPrivateMethod with the new ClassMethod
                            // this is important since we can't just replace PrivateName with an Identifier
                            // Hence, we need to replace the entire ClassPrivateMethod Node
                            path.replaceWith(classMethod);
                        }
                    },
                });
            },
        },
    };
}
