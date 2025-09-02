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
 * Reverses the private method transformation by converting methods with prefix {@link PRIVATE_METHOD_PREFIX}
 * back to ClassPrivateMethod nodes. This runs after babelClassPropertiesPlugin to restore private methods.
 * @see {@link ./private-method-transform.ts} for original transformation
 */
export default function reversePrivateMethodTransform({
    types: t,
}: BabelAPI): Visitor<LwcBabelPluginPass> {
    return {
        ClassMethod(path: NodePath<types.ClassMethod>) {
            const key = path.get('key');

            // Check if the key is an identifier with our special prefix
            if (key.isIdentifier()) {
                const methodName = key.node.name;

                // Check if this method has our special prefix
                if (methodName.startsWith(PRIVATE_METHOD_PREFIX)) {
                    // Extract the original private method name
                    const originalPrivateName = methodName.replace(PRIVATE_METHOD_PREFIX, '');

                    // Create a new ClassPrivateMethod node to replace the ClassMethod
                    const classPrivateMethod = t.classPrivateMethod(
                        'method', // kind: 'method' | 'get' | 'set'
                        t.privateName(t.identifier(originalPrivateName)), // key
                        path.node.params, // params
                        path.node.body // body
                    );

                    // Replace the entire ClassMethod with the new ClassPrivateMethod
                    path.replaceWith(classPrivateMethod);
                }
            }
        },
    };
}
