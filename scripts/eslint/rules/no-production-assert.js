/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// import * as ts from "typescript";
// import * as Lint from "tslint";

// export class Rule extends Lint.Rules.AbstractRule {
//     public static metadata: Lint.IRuleMetadata = {
//         ruleName: 'no-production-assert',
//         description: 'Avoid leaking asserts into production code.',
//         rationale: Lint.Utils.dedent`
//             We should strip asserts when compiling the framework code for production environment.
//             For that the assertion code should be wrapped in: if (process.env.NODE_ENV !== 'production') {}.
//         `,
//         hasFix: false,
//         type: 'functionality',
//         options: {},
//         optionsDescription: 'No options.',
//         typescriptOnly: true,
//     };

//     public static FAILURE_STRING = "No asserts allowed in production, wrap in a condition: if (process.env.NODE_ENV === 'production') {}";

//     public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
//         return this.applyWithFunction(sourceFile, walk);
//     }
// }

// function walk(ctx: Lint.WalkContext<void>) {
//     function cb(node: ts.Node): void {
//         if (node.kind === ts.SyntaxKind.IfStatement) {
//             const ifnode = node as ts.IfStatement;

//             if (ifnode.expression.getText() === "process.env.NODE_ENV !== 'production'") {
//                 if (ifnode.elseStatement) {
//                     // we need to look for asserts in the else statement.
//                     return ts.forEachChild(ifnode.elseStatement, cb);
//                 }
//             } else {
//                 // we need to analyze this node.
//                 return ts.forEachChild(node, cb);
//             }
//         } else if (node.kind === ts.SyntaxKind.PropertyAccessExpression) {
//             const isUsingAssert = node.getText().startsWith('assert.')
//                 && node.parent && node.parent.kind === ts.SyntaxKind.CallExpression;

//             if (isUsingAssert) {
//                 ctx.addFailureAtNode(node, Rule.FAILURE_STRING);
//             }
//         } else {
//             return ts.forEachChild(node, cb);
//         }
//     }

//     return ts.forEachChild(ctx.sourceFile, cb);
// }


module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Avoid leaking asserts into production code.'
        },
        messages: {
            unexpected: 'Unexpected assert statement not guarded by a if production check.'
        }
    },

    create(context) {
        return {
            Identifier(node) {
                const { name } = node;

                if (name === 'assert') {
                    context.report({
                        node,
                        messageId: 'unexpected'
                    });
                }
            }
        }
    }
}
