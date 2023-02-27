/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Add ?scoped=true to any imports ending with .scoped.css. This signals that the stylesheet
// should be treated as "scoped".
import { Node } from '@babel/core';
import { NodePath } from '@babel/traverse';
import { BabelAPI } from './types';

export default function ({ types: t }: BabelAPI, path: NodePath): void {
    const programPath = path.isProgram() ? path : path.findParent((node) => node.isProgram());

    (programPath!.get('body') as NodePath<Node>[]).forEach((node) => {
        if (node.isImportDeclaration()) {
            const source = node.get('source');
            if (source.type === 'StringLiteral' && source.node.value.endsWith('.scoped.css')) {
                source.replaceWith(t.stringLiteral(source.node.value + '?scoped=true'));
            }
        }
    });
}
