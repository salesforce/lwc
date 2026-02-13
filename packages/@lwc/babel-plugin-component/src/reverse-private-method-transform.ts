/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { PRIVATE_METHOD_PREFIX } from './constants';
import type { BabelAPI, LwcBabelPluginPass } from './types';
import type { types, NodePath, Visitor } from '@babel/core';

/**
 * Reverses the private method transformation by converting methods with prefix {@link PRIVATE_METHOD_PREFIX}
 * back to ClassPrivateMethod nodes. This runs after babelClassPropertiesPlugin to restore private methods.
 *
 * Round-trip parity: to match {@link ./private-method-transform.ts}, this transform must copy the same
 * properties from ClassMethod onto ClassPrivateMethod when present: returnType, typeParameters, loc,
 * abstract, access, accessibility, optional, override (plus async, generator, computed from the builder).
 *
 * @see {@link ./private-method-transform.ts} for original transformation
 */
export default function reversePrivateMethodTransform({
    types: t,
}: BabelAPI): Visitor<LwcBabelPluginPass> {
    return {
        ClassMethod(path: NodePath<types.ClassMethod>) {
            const key = path.get('key');

            // Check if the key is an identifier with our special prefix
            // kind: 'method' | 'get' | 'set' - only 'method' is in scope.
            if (key.isIdentifier() && path.node.kind === 'method') {
                const methodName = key.node.name;

                // Check if this method has our special prefix
                if (methodName.startsWith(PRIVATE_METHOD_PREFIX)) {
                    // Extract the original private method name
                    const originalPrivateName = methodName.replace(PRIVATE_METHOD_PREFIX, '');

                    // Create a new ClassPrivateMethod node to replace the ClassMethod
                    const node = path.node;
                    const classPrivateMethod = t.classPrivateMethod(
                        'method',
                        t.privateName(t.identifier(originalPrivateName)), // key
                        node.params,
                        node.body,
                        node.static
                    );

                    // Properties the t.classPrivateMethod() builder doesn't accept (same as forward transform)
                    classPrivateMethod.async = node.async;
                    classPrivateMethod.generator = node.generator;
                    classPrivateMethod.computed = node.computed;

                    // Round-trip parity with private-method-transform: preserve TS annotations and modifier flags
                    if (node.returnType != null) classPrivateMethod.returnType = node.returnType;
                    if (node.typeParameters != null)
                        classPrivateMethod.typeParameters = node.typeParameters;
                    if (node.loc != null) classPrivateMethod.loc = node.loc;
                    if (node.abstract != null) classPrivateMethod.abstract = node.abstract;
                    if (node.access != null) classPrivateMethod.access = node.access;
                    if (node.accessibility != null)
                        classPrivateMethod.accessibility = node.accessibility;
                    if (node.optional != null) classPrivateMethod.optional = node.optional;
                    if (node.override != null) classPrivateMethod.override = node.override;

                    // Replace the entire ClassMethod with the new ClassPrivateMethod
                    path.replaceWith(classPrivateMethod);
                }
            }
        },
    };
}