/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { DecoratorErrors } from '@lwc/errors';
import { PRIVATE_METHOD_PREFIX, PRIVATE_METHOD_METADATA_KEY } from './constants';
import { copyMethodMetadata, handleError } from './utils';
import type { BabelAPI, LwcBabelPluginPass } from './types';
import type { NodePath, PluginObj } from '@babel/core';
import type { types } from '@babel/core';

// We only transform kind: 'method'. Other kinds ('get', 'set', 'constructor') are left alone.
const METHOD_KIND = 'method';

/**
 * Standalone Babel plugin that transforms private method identifiers from
 * `#privateMethod` to `__lwc_component_class_internal_private_privateMethod`.
 *
 * This must be registered BEFORE the main LWC class transform plugin so that
 * private methods are converted to regular methods before decorator and class
 * property processing.
 *
 * Uses Program > path.traverse() rather than a top-level ClassPrivateMethod visitor
 * because the reverse transform has a ClassMethod visitor in the same Babel pass.
 * A direct ClassPrivateMethod visitor would replace nodes that the reverse transform
 * immediately converts back, creating an infinite loop. The manual traverse ensures
 * all forward replacements complete before the reverse visitor sees any ClassMethod.
 */
export default function privateMethodTransform({
    types: t,
}: BabelAPI): PluginObj<LwcBabelPluginPass> {
    return {
        visitor: {
            Program(path: NodePath<types.Program>, state: LwcBabelPluginPass) {
                const transformedNames = new Set<string>();

                // Phase 1: Collect base names of all private methods (kind: 'method')
                // so that Phase 2 can transform invocations even for forward references
                // (call site visited before the method definition).
                const privateMethodBaseNames = new Set<string>();
                path.traverse({
                    ClassPrivateMethod(methodPath: NodePath<types.ClassPrivateMethod>) {
                        const key = methodPath.get('key');
                        if (key.isPrivateName() && methodPath.node.kind === METHOD_KIND) {
                            privateMethodBaseNames.add(key.node.id.name);
                        }
                    },
                });

                // Phase 2: Transform definitions and invocations
                path.traverse(
                    {
                        ClassPrivateMethod(
                            methodPath: NodePath<types.ClassPrivateMethod>,
                            methodState: LwcBabelPluginPass
                        ) {
                            const key = methodPath.get('key');
                            if (!key.isPrivateName()) {
                                return;
                            }

                            if (methodPath.node.kind !== METHOD_KIND) {
                                handleError(
                                    methodPath,
                                    {
                                        errorInfo: DecoratorErrors.UNSUPPORTED_PRIVATE_MEMBER,
                                        messageArgs: ['accessor methods'],
                                    },
                                    methodState
                                );
                                return;
                            }

                            const node = methodPath.node;

                            // Reject private methods with decorators (e.g. @api, @track, @wire)
                            if (node.decorators && node.decorators.length > 0) {
                                handleError(
                                    methodPath,
                                    {
                                        errorInfo: DecoratorErrors.DECORATOR_ON_PRIVATE_METHOD,
                                    },
                                    methodState
                                );
                                return;
                            }

                            const privateName = key.node.id.name;
                            const transformedName = `${PRIVATE_METHOD_PREFIX}${privateName}`;
                            const keyReplacement = t.identifier(transformedName);

                            // Create a new ClassMethod node to replace the ClassPrivateMethod
                            // https://babeljs.io/docs/babel-types#classmethod
                            const classMethod = t.classMethod(
                                METHOD_KIND,
                                keyReplacement,
                                node.params,
                                node.body,
                                node.computed,
                                node.static,
                                node.generator,
                                node.async
                            ) as types.ClassMethod;

                            copyMethodMetadata(node, classMethod);

                            // Replace the entire ClassPrivateMethod node with the new ClassMethod node
                            // (we can't just replace the key of type PrivateName with type Identifier)
                            methodPath.replaceWith(classMethod);
                            transformedNames.add(transformedName);
                        },

                        MemberExpression(memberPath: NodePath<types.MemberExpression>) {
                            const property = memberPath.node.property;
                            if (t.isPrivateName(property)) {
                                const baseName = (property as types.PrivateName).id.name;
                                if (privateMethodBaseNames.has(baseName)) {
                                    const prefixedName = `${PRIVATE_METHOD_PREFIX}${baseName}`;
                                    memberPath
                                        .get('property')
                                        .replaceWith(t.identifier(prefixedName));
                                }
                            }
                        },

                        ClassPrivateProperty(
                            propPath: NodePath<types.ClassPrivateProperty>,
                            propState: LwcBabelPluginPass
                        ) {
                            handleError(
                                propPath,
                                {
                                    errorInfo: DecoratorErrors.UNSUPPORTED_PRIVATE_MEMBER,
                                    messageArgs: ['fields'],
                                },
                                propState
                            );
                        },
                    },
                    state
                );

                (state.file.metadata as any)[PRIVATE_METHOD_METADATA_KEY] = transformedNames;
            },
        },
    };
}
