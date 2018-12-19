/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// Based on ban rule from https://github.com/palantir/tslint
import { isCallExpression, isIdentifier, isPropertyAccessExpression, isFunctionDeclaration } from "tsutils";
import * as ts from "typescript";

import * as Lint from "tslint";

interface FunctionBan {
    name: string;
    message?: string;
}
interface MethodBan extends FunctionBan {
    object: string[];
}

interface Options {
    functions: FunctionBan[];
    methods: MethodBan[];
}

interface OptionsInput {
    name: string | string[];
    message?: string;
}

export class Rule extends Lint.Rules.AbstractRule {
    /* tslint:disable:object-literal-sort-keys */
    public static metadata: Lint.IRuleMetadata = {
        ruleName: "production-ban",
        description: "Bans the use of specific functions or methods in production.",
        optionsDescription: Lint.Utils.dedent`
            A list of banned functions or methods for production in the following format:
            * banning functions:
              * just the name of the function: \`"functionName"\`
              * the name of the function in an array with one element: \`["functionName"]\`
              * an object in the following format: \`{"name": "functionName", "message": "optional explanation message"}\`
            * banning methods:
              * an array with the object name, method name and optional message: \`["objectName", "methodName", "optional message"]\`
              * an object in the following format: \`{"name": ["objectName", "methodName"], "message": "optional message"}\`
                * you can also ban deeply nested methods: \`{"name": ["foo", "bar", "baz"]}\` bans \`foo.bar.baz()\`
                * the first element can contain a wildcard (\`*\`) that matches everything. \`{"name": ["*", "forEach"]}\` bans\
                  \`[].forEach(...)\`, \`$(...).forEach(...)\`, \`arr.forEach(...)\`, etc.
                  * the second element can contain a wildcard (\`*\`) that matches every method. \`{"name": ["assert", "*"]}\` bans
                  \`assert.isTrue(...)\`, \`assert.logError(...)\`, etc.
            `,
        options: {
            type: "list",
            listType: {
                anyOf: [
                    {
                        type: "string",
                    },
                    {
                        type: "array",
                        items: { type: "string" },
                        minLength: 1,
                        maxLength: 3,
                    },
                    {
                        type: "object",
                        properties: {
                            name: {
                                anyOf: [
                                    { type: "string" },
                                    { type: "array", items: { type: "string" }, minLength: 1 },
                                ],
                            },
                            message: { type: "string" },
                        },
                        required: ["name"],
                    },
                ],
            },
        },
        optionExamples: [
            [
                true,
                "patchLightningElementPrototypeWithRestrictions",
                { name: "patchCustomElementWithRestrictions", message: "You can't add restrictions to custom elements in production" },
                { name: ["assert", "*"], message: "No asserts allowed in production." },
            ],
        ],
        type: "functionality",
        typescriptOnly: false,
    };
    /* tslint:enable:object-literal-sort-keys */

    public static FAILURE_STRING_FACTORY(expression: string, messageAddition?: string) {
        return `Calls to '${expression}' are not allowed in production, wrap in a condition: if (process.env.NODE_ENV !== 'production') {}.${
            messageAddition !== undefined ? ` ${messageAddition}` : ""
            }`;
    }

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(
            new ProductionBanFunctionWalker(sourceFile, this.ruleName, parseOptions(this.ruleArguments)),
        );
    }
}

function parseOptions(args: Array<string | string[] | OptionsInput>): Options {
    const functions: FunctionBan[] = [];
    const methods: MethodBan[] = [];
    for (const arg of args) {
        if (typeof arg === "string") {
            functions.push({ name: arg });
        } else if (Array.isArray(arg)) {
            switch (arg.length) {
                case 0:
                    break;
                case 1:
                    functions.push({ name: arg[0] });
                    break;
                default:
                    methods.push({ object: [arg[0]], name: arg[1], message: arg[2] });
            }
        } else if (!Array.isArray(arg.name)) {
            functions.push(arg as FunctionBan);
        } else {
            switch (arg.name.length) {
                case 0:
                    break;
                case 1:
                    functions.push({ name: arg.name[0], message: arg.message });
                    break;
                default:
                    methods.push({
                        message: arg.message,
                        name: arg.name[arg.name.length - 1],
                        object: arg.name.slice(0, -1),
                    });
            }
        }
    }
    return { functions, methods };
}

class ProductionBanFunctionWalker extends Lint.AbstractWalker<Options> {
    public walk(sourceFile: ts.SourceFile) {
        const cb = (node: ts.Node): void => {
            if (isFunctionDeclaration(node) && this.isBannedFunction(node)) {
                return ;
            }

            if (node.kind === ts.SyntaxKind.IfStatement) {
                const ifnode = node as ts.IfStatement;

                if (ifnode.expression.getText() === "process.env.NODE_ENV !== 'production'") {
                    if (ifnode.elseStatement) {
                        // we need to look for asserts in the else statement.
                        return ts.forEachChild(ifnode.elseStatement, cb);
                    }

                    return ;
                } else {
                    // we need to analyze this node.
                    return ts.forEachChild(node, cb);
                }
            } else if (isCallExpression(node)) {
                if (isIdentifier(node.expression)) {
                    this.checkFunctionBan(node.expression);
                } else if (isPropertyAccessExpression(node.expression)) {
                    this.checkForObjectMethodBan(node.expression);
                }
            }
            return ts.forEachChild(node, cb);
        };
        return ts.forEachChild(sourceFile, cb);
    }

    private checkForObjectMethodBan(expression: ts.PropertyAccessExpression) {
        for (const ban of this.options.methods) {
            if (ban.name !== "*" && expression.name.text !== ban.name) {
                continue;
            }
            let current = expression.expression;
            for (let i = ban.object.length - 1; i > 0; --i) {
                if (!isPropertyAccessExpression(current) || (ban.name !== "*" && current.name.text !== ban.object[i])) {
                    continue;
                }
                current = current.expression;
            }
            if (
                ban.object[0] === "*" ||
                (isIdentifier(current) && current.text === ban.object[0])
            ) {
                this.addFailureAtNode(
                    expression,
                    Rule.FAILURE_STRING_FACTORY(`${ban.object.join(".")}.${ban.name}`, ban.message),
                );
                break;
            }
        }
    }

    private checkFunctionBan(name: ts.Identifier) {
        const { text } = name;
        for (const ban of this.options.functions) {
            if (ban.name === text) {
                this.addFailureAtNode(name, Rule.FAILURE_STRING_FACTORY(text, ban.message));
                break;
            }
        }
    }

    private isBannedFunction(node: ts.FunctionDeclaration) {
        if (!node.name) {
            return false;
        }

        const functionName = node.name.text;

        for (const ban of this.options.functions) {
            if (ban.name === functionName) {
                return true;
            }
        }

        return false;
    }
}
