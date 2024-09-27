/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { APIFeature, isAPIFeatureEnabled } from '@lwc/shared';
import * as t from '../shared/estree';
import { toPropertyName } from '../shared/utils';
import { ChildNode, LWCDirectiveRenderMode, Node } from '../shared/types';
import { isBaseElement, isForBlock, isIf, isParentNode, isSlot } from '../shared/ast';
import { IMPLICIT_STYLESHEET_IMPORTS, TEMPLATE_FUNCTION_NAME } from '../shared/constants';
import CodeGen from './codegen';

export function identifierFromComponentName(name: string): t.Identifier {
    return t.identifier(`_${toPropertyName(name)}`);
}

export function getMemberExpressionRoot(expression: t.MemberExpression): t.Identifier {
    let current: t.Expression | t.Identifier = expression;

    while (t.isMemberExpression(current)) {
        current = current.object as t.Expression;
    }

    return current as t.Identifier;
}

export function objectToAST(
    obj: object,
    valueMapper: (key: string) => t.Expression
): t.ObjectExpression {
    return t.objectExpression(
        Object.keys(obj).map((key) => t.property(t.literal(key), valueMapper(key)))
    );
}

/**
 * Returns true if the children should be flattened.
 *
 * This function searches through the children to determine if flattening needs to occur in the runtime.
 * Children should be flattened if they contain an iterator, a dynamic directive or a slot inside a light dom element.
 * @param codeGen
 * @param children
 */
export function shouldFlatten(codeGen: CodeGen, children: ChildNode[]): boolean {
    return children.some((child) => {
        return (
            // ForBlock will generate a list of iterable vnodes
            isForBlock(child) ||
            // light DOM slots - backwards-compatible behavior uses flattening, new behavior uses fragments
            (!isAPIFeatureEnabled(
                APIFeature.USE_FRAGMENTS_FOR_LIGHT_DOM_SLOTS,
                codeGen.apiVersion
            ) &&
                isSlot(child) &&
                codeGen.renderMode === LWCDirectiveRenderMode.light) ||
            // If node is only a control flow node and does not map to a stand alone element.
            // Search children to determine if it should be flattened.
            (isIf(child) && shouldFlatten(codeGen, child.children))
        );
    });
}

/**
 * Returns true if the AST element or any of its descendants use an id attribute.
 * @param node
 */
export function hasIdAttribute(node: Node): boolean {
    if (isBaseElement(node)) {
        const hasIdAttr = [...node.attributes, ...node.properties].some(
            ({ name }) => name === 'id'
        );

        if (hasIdAttr) {
            return true;
        }
    }

    if (isParentNode(node)) {
        return node.children.some((child) => hasIdAttribute(child));
    }

    return false;
}

export function generateTemplateMetadata(codeGen: CodeGen): t.Statement[] {
    const metadataExpressions: t.Statement[] = [];

    if (codeGen.slotNames.size) {
        const slotsProperty = t.memberExpression(
            t.identifier(TEMPLATE_FUNCTION_NAME),
            t.identifier('slots')
        );

        const slotsArray = t.arrayExpression(
            Array.from(codeGen.slotNames)
                .sort()
                .map((slot) => t.literal(slot))
        );

        const slotsMetadata = t.assignmentExpression('=', slotsProperty, slotsArray);
        metadataExpressions.push(t.expressionStatement(slotsMetadata));
    }

    // ignore when shadow because we don't want to modify template unnecessarily
    if (codeGen.renderMode === LWCDirectiveRenderMode.light) {
        const renderModeMetadata = t.assignmentExpression(
            '=',
            t.memberExpression(t.identifier(TEMPLATE_FUNCTION_NAME), t.identifier('renderMode')),
            t.literal('light')
        );
        metadataExpressions.push(t.expressionStatement(renderModeMetadata));
    }

    if (codeGen.hasRefs) {
        const refsMetadata = t.assignmentExpression(
            '=',
            t.memberExpression(t.identifier(TEMPLATE_FUNCTION_NAME), t.identifier('hasRefs')),
            t.literal(true)
        );
        metadataExpressions.push(t.expressionStatement(refsMetadata));
    }

    const stylesheetsMetadata = t.assignmentExpression(
        '=',
        t.memberExpression(t.identifier(TEMPLATE_FUNCTION_NAME), t.identifier('stylesheets')),
        t.arrayExpression([])
    );
    metadataExpressions.push(t.expressionStatement(stylesheetsMetadata));

    const stylesheetTokens = generateStylesheetTokens(codeGen);
    metadataExpressions.push(...stylesheetTokens);

    const implicitStylesheetImports = generateImplicitStylesheetImports();
    metadataExpressions.push(...implicitStylesheetImports);

    return metadataExpressions;
}

// Generates conditional statements to insert stylesheets into the
// tmpl.stylesheets metadata.
function generateImplicitStylesheetImports(): t.IfStatement[] {
    // tmpl.stylesheets
    const tmplStylesheetsExpr = t.memberExpression(
        t.identifier(TEMPLATE_FUNCTION_NAME),
        t.identifier('stylesheets')
    );
    // tmpl.stylesheets.push.apply
    const tmplStylesheetPushApplyExpr = t.memberExpression(
        t.memberExpression(tmplStylesheetsExpr, t.identifier('push')),
        t.identifier('apply')
    );

    // Generates conditional logic to the imported styleSheet, ex:
    // if (_implicitStylesheets) {
    //  tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
    // }
    const implicitStyleSheets = IMPLICIT_STYLESHEET_IMPORTS.map((styleSheetName) =>
        t.ifStatement(
            t.identifier(styleSheetName),
            t.blockStatement([
                t.expressionStatement(
                    t.callExpression(tmplStylesheetPushApplyExpr, [
                        tmplStylesheetsExpr,
                        t.identifier(styleSheetName),
                    ])
                ),
            ])
        )
    );

    return implicitStyleSheets;
}

function generateStylesheetTokens(codeGen: CodeGen): t.ExpressionStatement[] {
    const {
        apiVersion,
        state: {
            scopeTokens: { scopeToken, legacyScopeToken },
        },
    } = codeGen;

    const generateStyleTokenAssignmentExpr = (
        styleToken: 'stylesheetToken' | 'legacyStylesheetToken',
        styleTokenName: string
    ) => {
        // tmpl.stylesheetToken | tmpl.legacyStylesheetToken
        const styleTokenExpr = t.memberExpression(
            t.identifier(TEMPLATE_FUNCTION_NAME),
            t.identifier(styleToken)
        );
        return t.expressionStatement(
            t.assignmentExpression('=', styleTokenExpr, t.literal(styleTokenName))
        );
    };

    const styleTokens: t.ExpressionStatement[] = [];

    if (isAPIFeatureEnabled(APIFeature.LOWERCASE_SCOPE_TOKENS, apiVersion)) {
        // Include both the new and legacy tokens, so that the runtime can decide based on a flag whether
        // we need to render the legacy one. This is designed for cases where the legacy one is required
        // for backwards compat (e.g. global stylesheets that rely on the legacy format for a CSS selector).
        // tmpl.stylesheetToken = "{scopeToken}"
        styleTokens.push(generateStyleTokenAssignmentExpr('stylesheetToken', scopeToken));
        // tmpl.legacyStylesheetToken = "{legacyScopeToken}"
        styleTokens.push(
            generateStyleTokenAssignmentExpr('legacyStylesheetToken', legacyScopeToken)
        );
    } else {
        // In old API versions, we can just keep doing what we always did
        // tmpl.stylesheetToken = "{legacyScopeToken}"
        styleTokens.push(generateStyleTokenAssignmentExpr('stylesheetToken', legacyScopeToken));
    }

    return styleTokens;
}

const DECLARATION_DELIMITER = /;(?![^(]*\))/g;
const PROPERTY_DELIMITER = /:(.+)/s; // `/s` (dotAll) required to match styles across newlines, e.g. `color: \n red;`

// Borrowed from Vue template compiler.
// https://github.com/vuejs/vue/blob/531371b818b0e31a989a06df43789728f23dc4e8/src/platforms/web/util/style.js#L5-L16
export function parseStyleText(cssText: string): { [name: string]: string } {
    const styleMap: { [name: string]: string } = {};

    const declarations = cssText.split(DECLARATION_DELIMITER);
    for (const declaration of declarations) {
        if (declaration) {
            const [prop, value] = declaration.split(PROPERTY_DELIMITER);

            if (prop !== undefined && value !== undefined) {
                styleMap[prop.trim()] = value.trim();
            }
        }
    }

    return styleMap;
}

export function normalizeStyleAttribute(style: string): string {
    const styleMap = parseStyleText(style);

    const styles = Object.entries(styleMap).map(([key, value]) => {
        value = value.replace(IMPORTANT_FLAG, ' !important').trim();
        return `${key}: ${value};`;
    });

    return styles.join(' ');
}

const IMPORTANT_FLAG = /\s*!\s*important\s*$/i;

// Given a map of CSS property keys to values, return an array AST like:
// ['color', 'blue', false]    // { color: 'blue' }
// ['background', 'red', true] // { background: 'red !important' }
export function styleMapToStyleDeclsAST(styleMap: { [name: string]: string }): t.ArrayExpression {
    const styles: Array<[string, string] | [string, string, boolean]> = Object.entries(
        styleMap
    ).map(([key, value]) => {
        const important = IMPORTANT_FLAG.test(value);
        if (important) {
            value = value.replace(IMPORTANT_FLAG, '').trim();
        }
        return [key, value, important];
    });
    return t.arrayExpression(
        styles.map((arr) => t.arrayExpression(arr.map((val) => t.literal(val))))
    );
}

const CLASSNAME_DELIMITER = /\s+/;

export function parseClassNames(classNames: string): string[] {
    return classNames
        .split(CLASSNAME_DELIMITER)
        .map((className) => className.trim())
        .filter((className) => className.length);
}
