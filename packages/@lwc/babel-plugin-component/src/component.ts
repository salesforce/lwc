/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { basename, extname } from 'path';
import { addDefault, addNamed } from '@babel/helper-module-imports';
import { generateCustomElementTagName, getAPIVersionFromNumber } from '@lwc/shared';
import {
    COMPONENT_NAME_KEY,
    LWC_PACKAGE_ALIAS,
    REGISTER_COMPONENT_ID,
    TEMPLATE_KEY,
    API_VERSION_KEY,
    COMPONENT_CLASS_ID,
    SYNTHETIC_ELEMENT_INTERNALS_KEY,
} from './constants';
import type { types, NodePath, Visitor } from '@babel/core';
import type { BabelAPI, BabelTypes, LwcBabelPluginPass } from './types';

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
    const componentName = generateCustomElementTagName(namespace, name);
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
                node = (node as types.ClassDeclaration).id!;
            } else {
                // if it does not have an id, we can treat it as a ClassExpression
                t.toExpression(node as types.ClassDeclaration);
            }
        }

        const apiVersion = getAPIVersionFromNumber(state.opts.apiVersion);

        // Example:
        //     registerComponent(cmp, {
        //       tmpl: template,
        //       sel: 'x-foo',
        //       apiVersion: '58'
        //     })
        const properties = [
            t.objectProperty(t.identifier(TEMPLATE_KEY), templateIdentifier),
            t.objectProperty(t.identifier(COMPONENT_NAME_KEY), componentRegisteredName),
            // It's important that, at this point, we have an APIVersion rather than just a number.
            // The client needs to trust the server that it's providing an actual known API version
            t.objectProperty(t.identifier(API_VERSION_KEY), t.numericLiteral(apiVersion)),
        ];
        // Only include enableSyntheticElementInternals if explicitly defined
        if (typeof state.opts.enableSyntheticElementInternals === 'boolean') {
            const supportsSyntheticElementInternals = t.booleanLiteral(
                state.opts.enableSyntheticElementInternals || false
            );
            properties.push(
                t.objectProperty(
                    t.identifier(SYNTHETIC_ELEMENT_INTERNALS_KEY),
                    supportsSyntheticElementInternals
                )
            );
        }
        const registerComponentExpression = t.callExpression(registerComponentId, [
            node as types.Expression,
            t.objectExpression(properties),
        ]);

        // Example:
        // const __lwc_component_class_internal = registerComponent(cmp, ...);
        // This provides a way to access the component class for other lwc tools
        const classIdentifier = t.identifier(COMPONENT_CLASS_ID);
        declarationPath.parentPath.insertBefore(
            t.variableDeclaration('const', [
                t.variableDeclarator(classIdentifier, registerComponentExpression),
            ])
        );
        return classIdentifier;
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
