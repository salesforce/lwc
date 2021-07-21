/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as parse5 from 'parse5';
import * as he from 'he';

import defaultTreeAdapter from 'parse5/lib/tree-adapters/default';

import { CompilerDiagnostic, generateCompilerDiagnostic, ParserDiagnostics } from '@lwc/errors';

export const treeAdapter = defaultTreeAdapter;

export function parseHTML(source: string) {
    const errors: CompilerDiagnostic[] = [];

    const onParseError = (err: parse5.ParsingError) => {
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
        sourceCodeLocationInfo: true,
        onParseError,
    });

    return {
        fragment,
        errors,
    };
}

export function getSource(source: string, location: parse5.Location): string {
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
