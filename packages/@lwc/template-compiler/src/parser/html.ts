/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as parse5 from 'parse5-with-errors';
import * as he from 'he';

import { CompilerDiagnostic, generateCompilerDiagnostic, ParserDiagnostics } from '@lwc/errors';

export const treeAdapter = parse5.treeAdapters.default;

export function parseHTML(source: string) {
    const errors: CompilerDiagnostic[] = [];

    const onParseError = (err: parse5.Errors.ParsingError) => {
        const { code, startLine, startCol, startOffset, endOffset } = err;

        errors.push(
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

    const fragment = parse5.parseFragment(source, {
        locationInfo: true,
        onParseError,
    }) as parse5.AST.Default.DocumentFragment;

    return {
        fragment,
        errors,
    };
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
/**
 * In order to support property interpolation within text nodes, we ignore
 * how parse5 parses text nodes and instead grab the raw source string by
 * looking at the start and end offsets.  However, if a non-comforming HTML
 * tag is included in the template, that tag and its children will be
 * contained within the slice of the raw source string.
 *
 * For example, given the following template:
 *
 *  <template>
 *    <tr>
 *      <unknown></unknown>
 *    </tr>
 *  </template>
 *
 * There will be a single child text node of the <tr> tag.  It's value will
 * be a handful of whitespace characters.  The slice of the original source
 * using start and end offsets will include whitespace plus
 * "<unknown></unknown>" as a raw string.
 *
 * This function strips out the unparsed non-conforming HTML.
 */
export function omitNonconformingTags(node: parse5.AST.Default.TextNode, sourceSubString: string) {
    const { startOffset, endOffset } = node.__location!;

    const parent = node.parentNode as parse5.AST.Default.Element;
    const grandparent = parent?.parentNode as parse5.AST.Default.Element;
    let parentSibs = (grandparent?.childNodes as Array<parse5.AST.Default.Element>) || [];
    parentSibs = parentSibs.slice().reverse();

    for (const parentSib of parentSibs) {
        if (!parentSib?.__location) {
            continue;
        }
        if (parentSib === parent) {
            continue;
        }

        const relativeStartOffset = parentSib.__location.startOffset - startOffset;
        const relativeEndOffset = parentSib.__location.endOffset - endOffset;
        const parentSibLen = parentSib.__location.endOffset - parentSib.__location.startOffset;

        if (relativeStartOffset >= 0 && relativeEndOffset <= 0) {
            // This text node envelops a non-comforming HTML tag.
            sourceSubString =
                sourceSubString.slice(0, relativeStartOffset) +
                sourceSubString.slice(relativeStartOffset + parentSibLen);
        }
    }

    return sourceSubString;
}

export function decodeTextContent(source: string): string {
    return he.decode(source);
}
