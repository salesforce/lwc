/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { basename, extname } from 'node:path';
import * as types from '@babel/types';
import { addDefault, addNamed } from '@babel/helper-module-imports';
import { NodePath } from '@babel/traverse';
import { Visitor } from '@babel/core';
import { LWC_PACKAGE_ALIAS, REGISTER_COMPONENT_ID, TEMPLATE_KEY } from './constants';
import { BabelAPI, LwcBabelPluginPass } from './types';

function getBaseName(classPath: string) {
    const ext = extname(classPath);
    return basename(classPath, ext);
}

function importDefaultTemplate(
    path: NodePath<
        | types.ClassDeclaration
        | types.FunctionDeclaration
        | types.TSDeclareFunction
        | types.Expression
    >,
    state: LwcBabelPluginPass
) {
    const { filename } = state.file.opts;
    const componentName = getBaseName(filename!);
    return addDefault(path, `./${componentName}.html`, {
        nameHint: TEMPLATE_KEY,
    });
}

function needsComponentRegistration(
    path: NodePath<
        | types.ClassDeclaration
        | types.FunctionDeclaration
        | types.TSDeclareFunction
        | types.Expression
    >
) {
    return (
        (path.isIdentifier() && path.node.name !== 'undefined' && path.node.name !== 'null') ||
        path.isCallExpression() ||
        path.isClassDeclaration() ||
        path.isConditionalExpression()
    );
}

export default function ({ types: t }: BabelAPI): Visitor<LwcBabelPluginPass> {
    function createRegisterComponent(
        declarationPath: NodePath<
            | types.ClassDeclaration
            | types.FunctionDeclaration
            | types.TSDeclareFunction
            | types.Expression
        >,
        state: LwcBabelPluginPass
    ) {
        const registerComponentId = addNamed(
            declarationPath,
            REGISTER_COMPONENT_ID,
            LWC_PACKAGE_ALIAS
        );
        const templateIdentifier = importDefaultTemplate(declarationPath, state);
        const statementPath = declarationPath.getStatementParent();
        let node = declarationPath.node;

        if (declarationPath.isClassDeclaration()) {
            const hasIdentifier = t.isIdentifier((node as types.ClassDeclaration).id);
            if (hasIdentifier) {
                statementPath!.insertBefore(node);
                node = (node as types.ClassDeclaration).id;
            } else {
                // if it does not have an id, we can treat it as a ClassExpression
                t.toExpression(node as types.ClassDeclaration);
            }
        }

        return t.callExpression(registerComponentId, [
            node as unknown as types.Expression,
            t.objectExpression([t.objectProperty(t.identifier(TEMPLATE_KEY), templateIdentifier)]),
        ]);
    }

    return {
        ExportDefaultDeclaration(path, state) {
            const implicitResolution = !state.opts.isExplicitImport;
            if (implicitResolution) {
                const declaration = path.get('declaration');
                if (needsComponentRegistration(declaration)) {
                    declaration.replaceWith(createRegisterComponent(declaration, state));
                }
            }
        },
    };
}
