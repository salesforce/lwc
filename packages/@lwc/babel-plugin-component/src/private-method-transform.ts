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
 * Uses the `pre` lifecycle hook to run all transformations in a single pass
 * before the visitor phase, guaranteeing the traversal executes exactly once.
 */
export default function privateMethodTransform({
    types: t,
}: BabelAPI): PluginObj<LwcBabelPluginPass> {
    return {
        visitor: {},
        pre() {
            const state = this as LwcBabelPluginPass;
            const programPath = state.file.path as NodePath<types.Program>;
            const transformedNames = new Set<string>();

            // Phase 1: Collect base names of all private methods (kind: 'method')
            // so that Phase 2 can transform invocations even for forward references
            // (call site visited before the method definition).
            const privateMethodBaseNames = new Set<string>();
            programPath.traverse({
                ClassPrivateMethod(methodPath: NodePath<types.ClassPrivateMethod>) {
                    const key = methodPath.get('key');
                    if (key.isPrivateName() && methodPath.node.kind === METHOD_KIND) {
                        privateMethodBaseNames.add(key.node.id.name);
                    }
                },
            });

            // Phase 2: Transform definitions and invocations
            programPath.traverse(
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
                            return;
                        }

                        const node = methodPath.node;

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

                        methodPath.replaceWith(classMethod);
                        transformedNames.add(transformedName);
                    },

                    PrivateName(privatePath: NodePath<types.PrivateName>) {
                        const baseName = privatePath.node.id.name;
                        if (!privateMethodBaseNames.has(baseName)) {
                            return;
                        }
                        const parentPath = privatePath.parentPath;
                        if (parentPath.isMemberExpression()) {
                            const prefixedName = `${PRIVATE_METHOD_PREFIX}${baseName}`;
                            privatePath.replaceWith(t.identifier(prefixedName));
                        }
                    },
                },
                state
            );

            (state.file.metadata as any)[PRIVATE_METHOD_METADATA_KEY] = transformedNames;
        },
    };
}
