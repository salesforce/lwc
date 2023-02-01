/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as parse5 from 'parse5';
import { DefaultTreeAdapterMap, DocumentFragment } from 'parse5/dist/tree-adapters/default';
import * as he from 'he';
import { parseExpressionAt, Node as AcornNode } from 'acorn';

import { ParserDiagnostics } from '@lwc/errors';

import { sourceLocation } from '../shared/ast';

import ParserCtx from './parser';
import { errorCodesToErrorOn, errorCodesToWarnOn } from './parse5Errors';

function getLwcErrorFromParse5Error(code: string) {
    /* istanbul ignore else */
    if (errorCodesToErrorOn.has(code)) {
        return ParserDiagnostics.INVALID_HTML_SYNTAX;
    } else if (errorCodesToWarnOn.has(code)) {
        return ParserDiagnostics.INVALID_HTML_SYNTAX_WARNING;
    } else {
        // It should be impossible to reach here; we have a test in parser.spec.ts to ensure
        // all error codes are accounted for. But just to be safe, make it a warning.
        // TODO [#2650]: better system for handling unexpected parse5 errors
        // eslint-disable-next-line no-console
        console.warn('Found a Parse5 error that we do not know how to handle:', code);
        return ParserDiagnostics.INVALID_HTML_SYNTAX_WARNING;
    }
}

const OPENING_CURLY_BRACKET = 0x7b;
const CLOSING_CURLY_BRACKET = 0x7d;

// @ts-ignore
class TemplateHtmlTokenizer extends parse5.Tokenizer {
    parser: TemplateHtmlParser;

    private checkedAttrs = new WeakSet<parse5.Token.Attribute>();

    // This property is defined on the superclass as private; we're redefining it
    // here to avoid TypeScript warnings regarding private property access.
    private currentAttr: parse5.Token.Attribute = { name: '', value: '' };

    constructor(options: parse5.TokenizerOptions, parser: TemplateHtmlParser) {
        super(options, parser);
        this.parser = parser;
    }

    _stateAttributeValueUnquoted(cp: number) {
        if (cp === OPENING_CURLY_BRACKET && !this.checkedAttrs.has(this.currentAttr)) {
            this.checkedAttrs.add(this.currentAttr);
            // We add one to the offset to account for the opening curly brace.
            const startIdx: number = this.preprocessor.offset + 1;
            const { html } = this.preprocessor;
            const parsedJsExpression = parseExpressionAt(html, startIdx, {
                ecmaVersion: 2022,
                locations: true,
                ranges: true,
            });
            this.parser.cacheParsedJsExpression(html, startIdx, parsedJsExpression);
            const expressionLen = parsedJsExpression.end - parsedJsExpression.start;

            const endIdx = startIdx + expressionLen;
            if (html.codePointAt(endIdx) !== CLOSING_CURLY_BRACKET) {
                throw new Error('IPITYTHEFOOL: Expression must end with curly brace!');
            }
            // @ts-ignore
            this._advanceBy(expressionLen);
            this.currentAttr.value += html.slice(startIdx - 1, endIdx);
        } else {
            // If the first character in an unquoted attr value is not an opening
            // curly brace, it isn't a template expression. Opening curly braces
            // coming _later_ in an unquoted attr value should not be considered
            // the beginning of a template expression.
            this.checkedAttrs.add(this.currentAttr);
            // @ts-ignore
            super._stateAttributeValueUnquoted.call(this, cp);
            // (parse5.Tokenizer.prototype as any)._stateAttributeValueUnquoted.call(this, cp);
        }
    }
}

class TemplateHtmlParser extends parse5.Parser<DefaultTreeAdapterMap> {
    preparsedJsExpressions: Map<string, Map<number, AcornNode>>;

    constructor(
        options?: parse5.ParserOptions<DefaultTreeAdapterMap>,
        document?: DefaultTreeAdapterMap['document'],
        public fragmentContext: DefaultTreeAdapterMap['element'] | null = null,
        public scriptHandler:
            | null
            | ((pendingScript: DefaultTreeAdapterMap['element']) => void) = null
    ) {
        super(options, document, fragmentContext, scriptHandler);
        this.tokenizer = new TemplateHtmlTokenizer(
            this.options,
            this
        ) as unknown as parse5.Tokenizer;
        this.preparsedJsExpressions = new Map();
    }

    cacheParsedJsExpression(sourceHtml: string, expressionStartIdx: number, node: AcornNode) {
        if (!this.preparsedJsExpressions.has(sourceHtml)) {
            this.preparsedJsExpressions.set(sourceHtml, new Map());
        }
        const sourceCachedExpressions = this.preparsedJsExpressions.get(sourceHtml)!;
        sourceCachedExpressions.set(expressionStartIdx, node);
    }
}

export function parseHTML(ctx: ParserCtx, source: string) {
    const onParseError = (err: parse5.ParsingError) => {
        const { code, ...location } = err;

        const lwcError = getLwcErrorFromParse5Error(code);
        ctx.warnAtLocation(lwcError, sourceLocation(location as parse5.Token.Location), [code]);
    };

    const parser = TemplateHtmlParser.getFragmentParser(null, {
        sourceCodeLocationInfo: true,
        onParseError,
    }) as TemplateHtmlParser;
    parser.preparsedJsExpressions = ctx.preparsedJsExpressions;
    parser.tokenizer.write(source, true);
    return parser.getFragment() as DocumentFragment;
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
