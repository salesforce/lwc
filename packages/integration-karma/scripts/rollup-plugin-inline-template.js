/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const babel = require('@babel/core');
const templateCompiler = require('@lwc/template-compiler');

const INLINE_TEMPLATE_TAG_NAME = 'html';
const TEST_UTIL_MODULE_NAME = 'test-utils';

function inlineTemplatePlugin({ types: t }) {
    let htmlImportSpecifier;

    function isInlineTemplate(path) {
        const { scope, node: { tag } } = path;

        const isHtmlTag = t.isIdentifier(tag) && tag.name === INLINE_TEMPLATE_TAG_NAME;
        if (!isHtmlTag) {
            return;
        }

        const tagBinding = scope.getBinding(INLINE_TEMPLATE_TAG_NAME);

        const isTagGlobal = tagBinding === undefined;
        if (isTagGlobal) {
            return;
        }

        const declaration = tagBinding.path.node;
        return declaration === htmlImportSpecifier;
    }

    return {
        visitor: {
            ImportSpecifier(path) {
                if (
                    path.node.imported.name === INLINE_TEMPLATE_TAG_NAME &&
                    path.parentPath.node.source.value === TEST_UTIL_MODULE_NAME
                ) {
                    if (htmlImportSpecifier !== undefined) {
                        throw path.buildCodeFrameError('Multiple import of "html" from "test-utils".');
                    }

                    htmlImportSpecifier = path.node;
                }
            },

            TaggedTemplateExpression(path) {
                const { node } = path;

                if (!isInlineTemplate(path)) {
                    return;
                }

                if (node.quasi.quasis.length > 1) {
                    throw path.buildCodeFrameError('Invalid inline template definition');
                }

                const templateElement = node.quasi.quasis[0];
                const content = templateElement.value.raw;

                let templateFn = templateCompiler.compileToFunction(content).toString();
                templateFn = templateFn.replace('return tmpl;', 'return Engine.registerTemplate(tmpl);');

                path.replaceWithSourceString(templateFn);
            },

            Program: {
                enter() {
                    htmlImportSpecifier = undefined;
                },

                exit(path) {
                    if (!htmlImportSpecifier) {
                        return;
                    }

                    // Force scope reference count recalculation.
                    path.scope.crawl();

                    // Remove html import if not necessary anymore
                    const htmlBinding = path.scope.getBinding(INLINE_TEMPLATE_TAG_NAME);
                    if (htmlBinding.references === 0) {
                        htmlBinding.path.remove();
                    }
                }
            }
        },
    };
}

module.exports = function inlineTemplate() {
    return {
        transform(src, file) {
            const { code, map } = babel.transformSync(src, {
                filename: file,
                plugins: [inlineTemplatePlugin],
                parserOpts: {
                    plugins: [
                        'classProperties',
                        ['decorators', { decoratorsBeforeExport: true }],
                    ],
                },
            });

            console.log(code);

            return {
                code,
                map
            };
        },
    };
};
