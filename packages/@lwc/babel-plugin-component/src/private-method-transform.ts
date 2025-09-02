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
 * Transforms private method identifiers from #privateMethod to __internal_only_privateMethod
 * This function returns a Program visitor that transforms private methods before other plugins process them
 */
export default function privateMethodTransform({
    types: t,
}: BabelAPI): Visitor<LwcBabelPluginPass> {
    return {
        // We need to run this plugin at "Program" level and not just at "ClassPrivateMethod"
        // This is done to prevent *any* other plugins which has visitors on ClassPrivateMethod from seeing the original Node
        Program: {
            enter(path: NodePath<types.Program>) {
                // Transform private methods BEFORE any other plugin processes them
                path.traverse({
                    ClassPrivateMethod(path: NodePath<types.ClassPrivateMethod>) {
                        const key = path.get('key');

                        if (key.isPrivateName()) {
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
