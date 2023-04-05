/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { basename, extname } from 'path';
import * as types from '@babel/types';
import { addDefault, addNamed } from '@babel/helper-module-imports';
import { NodePath } from '@babel/traverse';
import { Visitor } from '@babel/core';
import {
    COMPONENT_NAME_KEY,
    LWC_PACKAGE_ALIAS,
    REGISTER_COMPONENT_ID,
    TEMPLATE_KEY,
} from './constants';
import { BabelAPI, BabelTypes, LwcBabelPluginPass } from './types';

function getBaseName(classPath: string) {
    const ext = extname(classPath);
    return basename(classPath, ext);
}

type DeclarationPath = NodePath<
    types.ClassDeclaration | types.FunctionDeclaration | types.Expression
>;

function importDefaultTemplate(path: DeclarationPath, state: LwcBabelPluginPass) {
    const { filename } = state.file.opts;
    const componentName = getBaseName(filename!);
    return addDefault(path, `./${componentName}.html`, {
        nameHint: TEMPLATE_KEY,
    });
}

function needsComponentRegistration(path: DeclarationPath) {
    return (
        (path.isIdentifier() && path.node.name !== 'undefined' && path.node.name !== 'null') ||
        path.isCallExpression() ||
        path.isClassDeclaration() ||
        path.isConditionalExpression()
    );
}

function getComponentRegisteredName(t: BabelTypes, state: LwcBabelPluginPass) {
    const { namespace, name } = state.opts;
    const componentName = namespace && name ? `${namespace}-${name}` : '';
    return t.stringLiteral(componentName);
}

export default function ({ types: t }: BabelAPI): Visitor<LwcBabelPluginPass> {
    function createRegisterComponent(declarationPath: DeclarationPath, state: LwcBabelPluginPass) {
        const registerComponentId = addNamed(
            declarationPath,
            REGISTER_COMPONENT_ID,
            LWC_PACKAGE_ALIAS
        );
        const templateIdentifier = importDefaultTemplate(declarationPath, state);
        const statementPath = declarationPath.getStatementParent();
        const componentRegisteredName = getComponentRegisteredName(t, state);
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
            node as types.Expression,
            t.objectExpression([
                t.objectProperty(t.identifier(TEMPLATE_KEY), templateIdentifier),
                t.objectProperty(t.identifier(COMPONENT_NAME_KEY), componentRegisteredName),
            ]),
        ]);
    }

    return {
        ExportDefaultDeclaration(path, state) {
            const implicitResolution = !state.opts.isExplicitImport;
            if (implicitResolution) {
                const declaration = path.get('declaration') as DeclarationPath;
                if (needsComponentRegistration(declaration)) {
                    declaration.replaceWith(createRegisterComponent(declaration, state));
                }
            }
        },
    };
}
