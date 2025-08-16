/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import type { BabelTypes } from '../../types';
import type { DecoratorMeta } from '../index';

function isPrivateDecorator(decorator: DecoratorMeta) {
    return decorator.name === 'privateField';
}

export default function transform(
    t: BabelTypes,
    decoratorMetas: DecoratorMeta[],
    classBodyItems: any[]
) {
    const privateDecoratorMetas = decoratorMetas.filter(isPrivateDecorator);

    if (privateDecoratorMetas.length === 0) {
        return [];
    }

    // Transform each @privateField decorated member to temporary naming convention
    privateDecoratorMetas.forEach(({ path, propertyName, decoratedNodeType }) => {
        // Find the class member that this decorator was attached to
        const classMember = path.parentPath;
        if (!classMember) return;

        // Transform the property name to temporary private naming convention
        if (decoratedNodeType === 'property' || decoratedNodeType === 'method') {
            const key = classMember.get('key');
            if (key && !Array.isArray(key) && key.isIdentifier()) {
                // Transform the identifier to use temporary private naming convention
                const tempPrivateName = t.identifier(`__private_${propertyName}`);
                key.replaceWith(tempPrivateName);
            }
        }
    });

    // Transform access patterns within the class to use temporary naming convention
    classBodyItems.forEach((item) => {
        if (item.isClassMethod() || item.isClassProperty()) {
            const privateFieldNames = privateDecoratorMetas.map((d) => d.propertyName);

            item.traverse({
                MemberExpression(memberPath: any) {
                    const { object, property } = memberPath.node;
                    if (
                        t.isThisExpression(object) &&
                        t.isIdentifier(property) &&
                        privateFieldNames.includes(property.name)
                    ) {
                        // Transform this.propertyName to this.__private_propertyName
                        const tempPrivateName = t.identifier(`__private_${property.name}`);
                        memberPath.replaceWith(t.memberExpression(object, tempPrivateName, false));
                    }
                },
            });
        }
    });

    // Return empty array since we don't need any metadata for private fields
    return [];
}
