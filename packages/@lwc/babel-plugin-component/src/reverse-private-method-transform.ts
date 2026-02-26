/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { DecoratorErrors } from '@lwc/errors';
import { PRIVATE_METHOD_PREFIX, PRIVATE_METHOD_METADATA_KEY } from './constants';
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
    // Scoped to this plugin instance's closure. Safe as long as each Babel run creates a
    // fresh plugin via LwcReversePrivateMethodTransform(); would accumulate across files if
    // the same instance were ever reused.
    const reverseTransformedNames = new Set<string>();

    return {
        ClassMethod(path: NodePath<types.ClassMethod>, state: LwcBabelPluginPass) {
            const key = path.get('key');

            // Check if the key is an identifier with our special prefix
            // kind: 'method' | 'get' | 'set' - only 'method' is in scope.
            if (key.isIdentifier() && path.node.kind === 'method') {
                const methodName = key.node.name;

                // Check if this method has our special prefix
                if (methodName.startsWith(PRIVATE_METHOD_PREFIX)) {
                    const forwardTransformedNames: Set<string> | undefined = (
                        state.file.metadata as any
                    )[PRIVATE_METHOD_METADATA_KEY];

                    // If the method was not transformed by the forward pass, it is a
                    // user-defined method that collides with the reserved prefix.
                    // This will throw an error to tell the user to rename their function.
                    if (!forwardTransformedNames || !forwardTransformedNames.has(methodName)) {
                        const message =
                            DecoratorErrors.PRIVATE_METHOD_NAME_COLLISION.message.replace(
                                '{0}',
                                methodName
                            );
                        throw path.buildCodeFrameError(message);
                    }

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
                    reverseTransformedNames.add(methodName);
                }
            }
        },

        // After all nodes have been visited, verify that every method the forward transform
        // renamed was also restored by the reverse transform. A mismatch here means an
        // intermediate plugin (e.g. @babel/plugin-transform-class-properties) removed or
        // renamed a prefixed method, leaving a mangled name in the final output.
        Program: {
            exit(_path: NodePath<types.Program>, state: LwcBabelPluginPass) {
                const forwardTransformedNames: Set<string> | undefined = (
                    state.file.metadata as any
                )[PRIVATE_METHOD_METADATA_KEY];

                if (!forwardTransformedNames) {
                    return;
                }

                // Identify methods that were forward-transformed but never reverse-transformed
                const missingFromReverse: string[] = [];
                for (const name of forwardTransformedNames) {
                    if (!reverseTransformedNames.has(name)) {
                        missingFromReverse.push(name);
                    }
                }

                if (missingFromReverse.length > 0) {
                    throw new Error(
                        `Private method transform count mismatch: ` +
                            `forward transformed ${forwardTransformedNames.size} method(s), ` +
                            `but reverse transformed ${reverseTransformedNames.size}. ` +
                            `Missing reverse transforms for: ${missingFromReverse.join(', ')}`
                    );
                }
            },
        },
    };
}
