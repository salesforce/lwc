/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/*
 * After all our decorator transforms have run,
 * we call registerDecorators() to register the metadata
 * of all transformed decorators.
 */

const moduleImports = require('@babel/helper-module-imports');

const { REGISTER_DECORATORS_ID } = require('../constants');
const { isLWCNode } = require('../utils');

module.exports = function postProcess({ types: t }) {
    function collectDecoratedProperties(body) {
        const metaPropertyList = [];
        for (const classProps of body.get('body')) {
            if (classProps.isClassProperty({ static: true })) {
                const propertyNode = classProps.node;
                if (isLWCNode(propertyNode)) {
                    metaPropertyList.push(t.objectProperty(propertyNode.key, propertyNode.value));
                    classProps.remove();
                }
            }
        }
        return metaPropertyList;
    }

    function collectObservedFields(body, decoratedProperties) {
        const mappers = {
            ObjectExpression: ({ properties }) =>
                properties.map(({ key }) => {
                    if (t.isIdentifier(key)) {
                        return key.name;
                    } else if (t.isStringLiteral(key)) {
                        return key.value;
                    }
                }),
            ArrayExpression: ({ elements }) => elements.map(({ value }) => value),
        };

        const decoratedIdentifiers = decoratedProperties
            .map(({ value }) => mappers[value.type](value))
            .reduce((acc, identifiers) => acc.concat(identifiers), []);

        const nonDecoratedFields = body
            .get('body')
            .filter(
                (path) =>
                    t.isClassProperty(path.node) &&
                    !isLWCNode(path.node) &&
                    !path.node.static &&
                    t.isIdentifier(path.node.key) &&
                    !(decoratedIdentifiers.indexOf(path.node.key.name) >= 0)
            )
            .map((path) => path.node.key.name);

        return nonDecoratedFields.length
            ? t.objectProperty(t.identifier('fields'), t.valueToNode(nonDecoratedFields))
            : null;
    }

    function collectMetaPropertyList(klassBody) {
        const metaPropertyList = collectDecoratedProperties(klassBody);
        const observedFields = collectObservedFields(klassBody, metaPropertyList);

        if (observedFields) {
            metaPropertyList.push(observedFields);
        }

        return metaPropertyList;
    }

    function createRegisterDecoratorsCall(path, klass, props) {
        const id = moduleImports.addNamed(path, REGISTER_DECORATORS_ID, 'lwc');

        return t.callExpression(id, [klass, t.objectExpression(props)]);
    }

    // Babel reinvokes visitors for node reinsertion so we use this to avoid an infinite loop.
    const visitedClasses = new WeakSet();

    return {
        Class(path) {
            const { node } = path;

            if (visitedClasses.has(node)) {
                return;
            }
            visitedClasses.add(node);

            const metaPropertyList = collectMetaPropertyList(path.get('body'));
            if (metaPropertyList.length === 0) {
                return;
            }

            const hasIdentifier = t.isIdentifier(node.id);
            const shouldTransformAsClassExpression =
                path.isClassExpression() || (path.isClassDeclaration() && !hasIdentifier);

            if (shouldTransformAsClassExpression) {
                const classExpression = t.toExpression(node);
                path.replaceWith(
                    createRegisterDecoratorsCall(path, classExpression, metaPropertyList)
                );
            } else {
                const statementPath = path.getStatementParent();
                statementPath.insertAfter(
                    createRegisterDecoratorsCall(path, node.id, metaPropertyList)
                );
            }
        },
    };
};
