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
import type { NodePath, Visitor } from '@babel/core';
import type { types } from '@babel/core';

// We only transform kind: 'method'. Other kinds ('get', 'set', 'constructor') are left alone.
const METHOD_KIND = 'method';

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
                const transformedNames = new Set<string>();

                // Transform private methods BEFORE any other plugin processes them
                path.traverse(
                    {
                        ClassPrivateMethod(
                            methodPath: NodePath<types.ClassPrivateMethod>,
                            methodState: LwcBabelPluginPass
                        ) {
                            const key = methodPath.get('key');

                            if (key.isPrivateName() && methodPath.node.kind === METHOD_KIND) {
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
                            }
                        },
                    },
                    state
                );

                (state.file.metadata as any)[PRIVATE_METHOD_METADATA_KEY] = transformedNames;
            },
        },
    };
}
