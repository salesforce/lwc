/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { walk } from 'estree-walker';

import * as t from '../shared/estree';
import { TEMPLATE_PARAMS } from '../shared/constants';
import { isComponentProp } from '../shared/ir';
import { IRNode, TemplateExpression, TemplateIdentifier } from '../shared/types';
import { NodeRefProxy } from './NodeRefProxy';

interface ComponentPropsUsageData {
    name: string;
    localName: string;
    usage: NodeRefProxy;
    instances: number;
}

function dumpScope(scope: Scope, body: t.Statement[], scopeVars: Map<string, string>) {
    const nextScopeVars = new Map(scopeVars);
    const variablesInThisScope: [string, string][] = [];

    for (const [name, propData] of scope.usedProps) {
        // the variable is already defined in the scope.
        const generatedNameInScope = scopeVars.get(name);
        if (generatedNameInScope !== undefined) {
            propData.usage.swap(t.identifier(generatedNameInScope));
        } else if (propData.instances > 1 || scope.aggregatedPropNamesUsedInChildScopes.has(name)) {
            // name is not defined in the ancestor scopes, and is:
            // a) used multiple times in this scope.
            // b) used one time in this scope and at least once in one of the child scopes. Therefore
            //    we can compute it in this scope.
            const { localName } = propData;

            nextScopeVars.set(name, localName);
            propData.usage.swap(t.identifier(localName));
            variablesInThisScope.push([name, localName]);
        }
    }

    for (const childScope of scope.childScopes) {
        body.unshift(childScope.scopeFn!);
        dumpScope(childScope, childScope.scopeFn?.body!.body!, nextScopeVars);
    }

    // lastly, insert variables defined in this scope at the beginning of the body.
    if (variablesInThisScope.length > 0) {
        body.unshift(
            t.variableDeclaration('const', [
                t.variableDeclarator(
                    t.objectPattern(
                        variablesInThisScope.map(([name, localName]) =>
                            t.assignmentProperty(t.identifier(name), t.identifier(localName))
                        )
                    ),
                    t.identifier(TEMPLATE_PARAMS.INSTANCE)
                ),
            ])
        );
    }
}

export class Scope {
    id: number;
    parentScope: Scope | null = null;
    childScopes: Scope[] = [];
    scopeFn: t.FunctionDeclaration | null = null;

    usedProps = new Map<string, ComponentPropsUsageData>();
    private cachedAggregatedProps: Set<string> | undefined;

    private getPropName(identifier: TemplateIdentifier): t.MemberExpression | t.Identifier {
        const { name } = identifier;
        let memoizedPropName = this.usedProps.get(name);

        if (!memoizedPropName) {
            const generatedExpr = new NodeRefProxy(
                t.memberExpression(t.identifier(TEMPLATE_PARAMS.INSTANCE), identifier)
            );
            memoizedPropName = {
                name,
                localName: `$cv${this.id}_${this.usedProps.size}`,
                usage: generatedExpr,
                instances: 0,
            };
            this.usedProps.set(name, memoizedPropName);
        }

        memoizedPropName.instances++;

        return memoizedPropName.usage.instance;
    }

    constructor(id: number) {
        this.id = id;
    }

    setFn(
        params: t.FunctionExpression['params'],
        body: t.FunctionExpression['body'],
        kind: string
    ) {
        const id = t.identifier(`${kind}${this.id}_${this.childScopes.length}`);

        this.scopeFn = t.functionDeclaration(id, params, body);

        return id;
    }

    serializeInto(body: t.Statement[]) {
        dumpScope(this, body, new Map());
    }

    /**
     * Bind the passed expression to the component instance. It applies the following transformation to the expression:
     * - {value} --> {$cmp.value}
     * - {value[index]} --> {$cmp.value[$cmp.index]}
     */
    bindExpression(expression: TemplateExpression, irNode: IRNode): t.Expression {
        const self = this;
        if (t.isIdentifier(expression)) {
            if (isComponentProp(expression, irNode)) {
                return this.getPropName(expression);
            } else {
                return expression;
            }
        }

        walk(expression, {
            leave(node, parent) {
                if (
                    parent !== null &&
                    t.isIdentifier(node) &&
                    t.isMemberExpression(parent) &&
                    parent.object === node &&
                    isComponentProp(node, irNode)
                ) {
                    this.replace(self.getPropName(node));
                }
            },
        });

        return expression;
    }

    /**
     * Returns a set of used component properties in descendant scopes.
     * Note: Does not includes the current scope.
     */
    get aggregatedPropNamesUsedInChildScopes(): Set<string> {
        if (this.cachedAggregatedProps === undefined) {
            const aggregatedScope = new Set<string>();
            this.cachedAggregatedProps = aggregatedScope;

            for (const scope of this.childScopes) {
                // Aggregated props is defined as:
                // props used in child scopes + props used in the aggregated props of child scope.
                for (const [propName] of scope.usedProps) {
                    aggregatedScope.add(propName);
                }

                for (const propName of scope.aggregatedPropNamesUsedInChildScopes) {
                    aggregatedScope.add(propName);
                }
            }
        }

        return this.cachedAggregatedProps;
    }
}
