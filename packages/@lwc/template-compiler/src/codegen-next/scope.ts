/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { walk } from 'estree-walker';

import * as t from '../shared/estree';
import { TEMPLATE_PARAMS } from '../shared/constants';
import { Expression, Literal } from '../shared-next/types';

export default class Scope {
    private readonly scopes: t.Identifier[][] = [];

    beginScope() {
        this.scopes.push([]);
    }

    endScope() {
        this.scopes.pop();
    }

    peek() {
        return this.scopes[this.scopes.length - 1];
    }

    // declare(node: ParentNode) {
    //     // for (const prop of Object.values(node)) {
    //     //     if (t.isIdentifier(prop)) {
    //     //         this.peek().push(prop);
    //     //     }
    //     // }
    //     let key: keyof typeof node;
    //     for (key in node) {
    //         const prop = node[key];
    //         if (t.isIdentifier(prop)) {
    //             this.peek().push(prop);
    //         }
    //     }
    // }

    // declare<T extends t.BaseNode>(node: T) {
    //     for (const key in node) {
    //         const prop = node[key];
    //         if (typeof prop === 'object') {
    //             const prop2 = prop as unknown as t.BaseNode;
    //             if (t.isIdentifier(prop2)) {
    //                 this.peek().push(prop2);
    //             }
    //         }
    //     }
    // }

    // declare<T>(node: T) {
    //     for (const key in node) {
    //         const prop = node[key];
    //         if (typeof prop === 'symbol' && t.isIdentifier(prop))
    //     }
    // }

    // castToIdentifier<T>(prop: T): prop is t.Identifier {
    //     return
    // }

    // // jtu: look at this tomo, seems like the way to go
    // // https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type

    // validateIdentifier<T extends Record<K, BaseNode>, K extends keyof T>(item: T, key: K) {
    //     const prop = item[key];
    //     if (typeof prop === 'object' && t.isIdentifier(prop)) {
    //         this.peek().push(prop);
    //     }
    // }

    // declare<T>(node: T) {
    //     // let key: keyof typeof node;
    //     for (const key in node) {
    //         // const prop = node[key];
    //         // if ('type' in prop && t.isIdentifier(prop)) {
    //         //     this.peek().push(prop);
    //         // }
    //         const prop = this.typeChecker(node, key);
    //         if (prop && t.isIdentifier(prop as t.BaseNode)) {
    //             this.peek().push(prop as t.Identifier);
    //         }
    //     }
    // }

    // typeChecker<T, K extends keyof T>(item: T, key: K): unknown {
    //     const prop = item[key];
    //     if (typeof prop === 'object' && 'type' in prop) {
    //         return prop;
    //     }
    // }

    declare(identifier: t.Identifier) {
        this.peek().push(identifier);
    }

    resolve(identifier: t.Identifier) {
        for (const id of this.scopes.flat()) {
            if (identifier.name === id.name) {
                return false;
            }
        }
        return true;
    }

    // resolve(identifier: t.Identifier) {
    //     let match = false;
    //     for (const scope of this.scopes) {
    //         match = !!scope.find(id => id.name === identifier.name);
    //     }

    //     return match;
    // }

    // resolve2(resolver: (expr: Expression) => unknown) {
    //     for (const expression of this.scopes) {
    //         if (resolver(expression)) {
    //             return true;
    //         }
    //     }
    //     return false;
    // }

    // resolve(resolver: (expr: Expression) => unknown) {
    //     for (const expr of this.scopes.flat()) {
    //         if (resolver(expr)) {
    //             return true;
    //         }
    //     }
    //     return false;
    // }

    /**
     * Bind the passed expression to the component instance. It applies the following transformation to the expression:
     * - {value} --> {$cmp.value}
     * - {value[index]} --> {$cmp.value[$cmp.index]}
     */
    bindExpression(expression: Expression | Literal): t.Expression {
        if (t.isIdentifier(expression)) {
            // if (this.resolve((expr) => matchIdentifierName(expr, expression))) {
            if (this.resolve(expression)) {
                return t.memberExpression(t.identifier(TEMPLATE_PARAMS.INSTANCE), expression);
            } else {
                return expression;
            }
        }

        const scope = this;
        walk(expression, {
            leave(node, parent) {
                if (
                    parent !== null &&
                    t.isIdentifier(node) &&
                    t.isMemberExpression(parent) &&
                    parent.object === node &&
                    // scope.resolve((expr) => matchIdentifierName(expr, node))
                    scope.resolve(node)
                ) {
                    this.replace(t.memberExpression(t.identifier(TEMPLATE_PARAMS.INSTANCE), node));
                }
            },
        });

        return expression as t.Expression;
    }
}
