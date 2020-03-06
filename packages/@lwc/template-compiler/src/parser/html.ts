/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as parse5 from 'parse5-with-errors';
import * as he from 'he';

import { CompilerDiagnostic, generateCompilerDiagnostic, ParserDiagnostics } from '@lwc/errors';

import { VOID_ELEMENT_SET } from './constants';

interface NodeVisitor<N extends parse5.AST.Default.Node> {
    enter?: (node: N) => void;
    exit?: (node: N) => void;
}

interface Visitor {
    Comment?: NodeVisitor<parse5.AST.Default.CommentNode>;
    Text?: NodeVisitor<parse5.AST.Default.TextNode>;
    Element?: NodeVisitor<parse5.AST.Default.Element>;
}

export const treeAdapter = parse5.treeAdapters.default;

export function parseHTML(source: string) {
    const parsingErrors: CompilerDiagnostic[] = [];

    const onParseError = (err: parse5.Errors.ParsingError) => {
        const { code, startLine, startCol, startOffset, endOffset } = err;

        parsingErrors.push(
            generateCompilerDiagnostic(ParserDiagnostics.INVALID_HTML_SYNTAX, {
                messageArgs: [code],
                origin: {
                    location: {
                        line: startLine,
                        column: startCol,
                        start: startOffset,
                        length: endOffset - startOffset,
                    },
                },
            })
        );
    };

    const validateClosingTag = (node: parse5.AST.Default.Element) => {
        if (!node.__location) {
            return;
        }

        const { startTag, endTag } = node.__location;
        const isVoidElement = VOID_ELEMENT_SET.has(node.tagName);
        const missingClosingTag = !!startTag && !endTag;

        if (!isVoidElement && missingClosingTag) {
            parsingErrors.push(
                generateCompilerDiagnostic(ParserDiagnostics.NO_MATCHING_CLOSING_TAGS, {
                    messageArgs: [node.tagName],
                    origin: {
                        location: {
                            line: startTag.startLine || startTag.line,
                            column: startTag.startCol || startTag.col,
                            start: startTag.startOffset,
                            length: startTag.endOffset - startTag.startOffset,
                        },
                    },
                })
            );
        }
    };

    const fragment = parse5.parseFragment(source, {
        locationInfo: true,
        onParseError,
    }) as parse5.AST.Default.DocumentFragment;

    if (!parsingErrors.length) {
        traverseHTML(fragment, {
            Element: {
                enter: validateClosingTag,
            },
        });
    }

    return {
        fragment,
        errors: parsingErrors,
    };
}

export function traverseHTML(node: parse5.AST.Default.Node, visitor: Visitor): void {
    let nodeVisitor: NodeVisitor<any> | undefined;
    switch (node.nodeName) {
        case '#comment':
            nodeVisitor = visitor.Comment;
            break;

        case '#text':
            nodeVisitor = visitor.Text;
            break;

        default:
            nodeVisitor = visitor.Element;
    }

    if (nodeVisitor && nodeVisitor.enter) {
        nodeVisitor.enter(node);
    }

    // Node children are accessed differently depending on the node type:
    //  - standard elements have their children associated on the node itself
    //  - while the template node children are present on the content property.
    const children = treeAdapter.getChildNodes(treeAdapter.getTemplateContent(node) || node);

    // Traverse the node children if necessary.
    if (children !== undefined) {
        for (const child of children) {
            traverseHTML(child as parse5.AST.Default.Node, visitor);
        }
    }

    if (nodeVisitor && nodeVisitor.exit) {
        nodeVisitor.exit(node);
    }
}

export function getSource(source: string, location: parse5.MarkupData.Location): string {
    const { startOffset, endOffset } = location;
    return source.slice(startOffset, endOffset);
}

// https://github.com/babel/babel/blob/d33d02359474296402b1577ef53f20d94e9085c4/packages/babel-types/src/react.js#L9-L55
export function cleanTextNode(value: string): string {
    const lines = value.split(/\r\n|\n|\r/);
    let lastNonEmptyLine = 0;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/[^ \t]/)) {
            lastNonEmptyLine = i;
        }
    }

    let str = '';
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isFirstLine = i === 0;
        const isLastLine = i === lines.length - 1;
        const isLastNonEmptyLine = i === lastNonEmptyLine;

        let trimmedLine = line.replace(/\t/g, ' ');

        if (!isFirstLine) {
            trimmedLine = trimmedLine.replace(/^[ ]+/, '');
        }

        if (!isLastLine) {
            trimmedLine = trimmedLine.replace(/[ ]+$/, '');
        }

        if (trimmedLine) {
            if (!isLastNonEmptyLine) {
                trimmedLine += ' ';
            }

            str += trimmedLine;
        }
    }

    return str;
}

export function decodeTextContent(source: string): string {
    return he.decode(source);
}
