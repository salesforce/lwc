/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { DecoratorErrors } from '@lwc/errors';
import { PRIVATE_METHOD_PREFIX } from './constants';
import { handleError } from './utils';
import type { BabelAPI, LwcBabelPluginPass } from './types';
import type { NodePath, Visitor } from '@babel/core';
import type { types } from '@babel/core';

/**
 * Transforms private method identifiers from #privateMethod to __lwc_component_class_internal_private_privateMethod
 * This function returns a Program visitor that transforms private methods before other plugins process them
 */
export default function privateMethodTransform({
    types: t,
}: BabelAPI): Visitor<LwcBabelPluginPass> {
    return {
        Program: {
            enter(path: NodePath<types.Program>, state: LwcBabelPluginPass) {
                // Transform private methods BEFORE any other plugin processes them
                path.traverse(
                    {
                        ClassPrivateMethod(
                            methodPath: NodePath<types.ClassPrivateMethod>,
                            methodState: LwcBabelPluginPass
                        ) {
                            const key = methodPath.get('key');

                            // We only want kind: 'method'.
                            // Other options not included are 'get', 'set', and 'constructor'.
                            const methodKind = 'method';

                            if (key.isPrivateName() && methodPath.node.kind === methodKind) {
                                const node = methodPath.node;

                                // Reject private methods with decorators (e.g. @api, @track, @wire)
                                if (node.decorators && node.decorators.length > 0) {
                                    handleError(
                                        methodPath,
                                        { errorInfo: DecoratorErrors.DECORATOR_ON_PRIVATE_METHOD },
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
                                    methodKind,
                                    keyReplacement,
                                    node.params,
                                    node.body,
                                    node.computed,
                                    node.static,
                                    node.generator,
                                    node.async
                                ) as types.ClassMethod;

                                // Preserve TypeScript annotations and source location when present
                                if (node.returnType != null) {
                                    classMethod.returnType = node.returnType;
                                }
                                if (node.typeParameters != null) {
                                    classMethod.typeParameters = node.typeParameters;
                                }
                                if (node.loc != null) {
                                    classMethod.loc = node.loc;
                                }
                                // Preserve TypeScript/ECMAScript modifier flags (excluded from t.classMethod() builder)
                                if (node.abstract != null) {
                                    classMethod.abstract = node.abstract;
                                }
                                if (node.access != null) {
                                    classMethod.access = node.access;
                                }
                                if (node.accessibility != null) {
                                    classMethod.accessibility = node.accessibility;
                                }
                                if (node.optional != null) {
                                    classMethod.optional = node.optional;
                                }
                                if (node.override != null) {
                                    classMethod.override = node.override;
                                }

                                // Replace the entire ClassPrivateMethod node with the new ClassMethod node
                                // (we can't just replace the key of type PrivateName with type Identifier)
                                methodPath.replaceWith(classMethod);
                            }
                        },
                    },
                    state
                );
            },
        },
    };
}
