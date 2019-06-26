/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as parse5 from 'parse5-with-errors';

import {
    CompilerDiagnostic,
    generateCompilerDiagnostic,
    LWCErrorInfo,
    ParserDiagnostics,
} from '@lwc/errors';

import { parseHTML, traverseHTML, treeAdapter } from './html';

function filter(node: parse5.AST.Default.Element) {
    delete node.parentNode;
    delete node.__location;

    let nodeToFilter = node;

    const content = treeAdapter.getTemplateContent(node);
    if (content) {
        nodeToFilter = content as parse5.AST.Default.Element;
    }

    filterChildNodes(nodeToFilter);
}

function filterChildNodes(node: parse5.AST.Default.Element) {
    node.childNodes = node.childNodes.filter(childNode => {
        return !treeAdapter.isTextNode(childNode) && !treeAdapter.isCommentNode(childNode);
    });
}

export function experimentalParse(source: string) {
    const warnings: CompilerDiagnostic[] = [];
    const { fragment, errors: parsingErrors } = parseHTML(source);

    if (parsingErrors.length !== 0) {
        return { warnings: parsingErrors };
    }

    const templateRoot = getTemplateRoot(fragment);
    if (!templateRoot) {
        return { warnings };
    }

    traverseHTML(templateRoot, {
        Element: {
            enter(node: parse5.AST.Default.Element) {
                filter(node);
            },
        },
    });

    const root = templateRoot as unknown;
    return root;

    function getTemplateRoot(
        documentFragment: parse5.AST.Default.DocumentFragment
    ): parse5.AST.Default.Element | undefined {
        // Filter all the empty text nodes
        const validRoots = documentFragment.childNodes.filter(
            child =>
                treeAdapter.isElementNode(child) ||
                (treeAdapter.isTextNode(child) &&
                    treeAdapter.getTextNodeContent(child).trim().length)
        );

        if (validRoots.length > 1) {
            warnOnElement(ParserDiagnostics.MULTIPLE_ROOTS_FOUND, documentFragment.childNodes[1]);
        }

        const templateTag = documentFragment.childNodes.find(child =>
            treeAdapter.isElementNode(child)
        );

        if (!templateTag) {
            warnAt(ParserDiagnostics.MISSING_ROOT_TEMPLATE_TAG);
        } else {
            return templateTag as parse5.AST.Default.Element;
        }
    }

    function warnOnElement(errorInfo: LWCErrorInfo, node: parse5.AST.Node, messageArgs?: any[]) {
        const getLocation = (
            toLocate?: parse5.AST.Node
        ): { line: number; column: number; start: number; length: number } => {
            if (!toLocate) {
                return { line: 0, column: 0, start: 0, length: 0 };
            }

            const location = (toLocate as parse5.AST.Default.Element).__location;

            if (!location) {
                return getLocation(treeAdapter.getParentNode(toLocate));
            } else {
                return {
                    line: location.line || location.startLine,
                    column: location.col || location.startCol,
                    start: location.startOffset,
                    length: location.endOffset - location.startOffset,
                };
            }
        };

        addDiagnostic(
            generateCompilerDiagnostic(errorInfo, {
                messageArgs,
                origin: {
                    location: getLocation(node),
                },
            })
        );
    }

    function warnAt(
        errorInfo: LWCErrorInfo,
        messageArgs?: any[],
        location?: parse5.MarkupData.Location
    ) {
        addDiagnostic(
            generateCompilerDiagnostic(errorInfo, {
                messageArgs,
                origin: {
                    location: normalizeLocation(location),
                },
            })
        );
    }

    // TODO: #1286 - Update parse5-with-error to match version used for jsdom (interface for ElementLocation changed)
    function normalizeLocation(
        location?: parse5.MarkupData.Location
    ): { line: number; column: number; start: number; length: number } {
        let line = 0;
        let column = 0;
        let start = 0;
        let length = 0;

        if (location) {
            const { startOffset, endOffset } = location;
            line = location.line || location.startLine;
            column = location.col || location.startCol;
            start = startOffset;
            length = endOffset - startOffset;
        }
        return { line, column, start, length };
    }

    function addDiagnostic(diagnostic: CompilerDiagnostic) {
        warnings.push(diagnostic);
    }
}
