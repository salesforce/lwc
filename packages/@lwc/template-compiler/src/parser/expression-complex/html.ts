/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { parseExpressionAt } from 'acorn';
import { ParserDiagnostics, invariant } from '@lwc/errors';
import { Parser, Tokenizer } from 'parse5';
import { Document, DocumentFragment, TextNode, ParserError, ParserOptions } from '../parse5Types';
import { TMPL_EXPR_ECMASCRIPT_EDITION } from '../constants';
import type ParserCtx from '../parser';
import type { PreparsedExpressionMap } from './types';

const OPENING_CURLY_LEN = 1;
const CLOSING_CURLY_LEN = 1;
const OPENING_CURLY_BRACKET = 0x7b;
const CLOSING_CURLY_BRACKET = 0x7d;
const WHITESPACE = /\s*/;
const TRAILING_SPACES_AND_PARENS = /[\s)]*/;

function getWhitespaceLen(str: string): number {
    return WHITESPACE.exec(str)![0].length;
}

function getTrailingChars(str: string): string {
    return TRAILING_SPACES_AND_PARENS.exec(str)![0];
}

/**
 * This function checks for "unbalanced" extraneous parentheses surrounding the expression.
 *
 * Examples of balanced extraneous parentheses (validation passes):
 *   {(foo.bar)}        <-- the MemberExpressions does not account for the surrounding parens
 *   {(foo())}          <-- the CallExpression does not account for the surrounding parens
 *   {((foo ?? bar)())} <-- the CallExpression does not account for the surrounding parens
 *
 * Examples of unbalanced extraneous parentheses (validation fails):
 *   {(foo.bar))}       <-- there is an extraneous trailing paren
 *   {foo())}           <-- there is an extraneous trailing paren
 *
 * Examples of no extraneous parentheses (validation passes):
 *   {foo()}            <-- the CallExpression accounts for the trailing paren
 *   {(foo ?? bar).baz} <-- the outer MemberExpression accounts for the leading paren
 *   {(foo).bar}        <-- the outer MemberExpression accounts for the leading paren
 *
 * Notably, no examples of extraneous leading parens could be found - these result in a
 * parsing error in Acorn. However, this function still checks, in case there is an
 * unknown expression that would parse with an extraneous leading paren.
 */
function validateMatchingExtraParens(leadingChars: string, trailingChars: string) {
    const numLeadingParens = leadingChars.split('(').length - 1;
    const numTrailingParens = trailingChars.split(')').length - 1;
    invariant(
        numLeadingParens === numTrailingParens,
        ParserDiagnostics.TEMPLATE_EXPRESSION_PARSING_ERROR,
        ['expression must have balanced parentheses.']
    );
}

/**
 * This class extends `parse5`'s internal tokenizer.
 *
 * Its behavior diverges from that specified in the WHATWG HTML spec
 * in two places:
 *   - 13.2.5.38 - unquoted attribute values
 *   - 13.2.5.1 - the "data" state, which corresponds to parsing outside of tags
 *
 * Specifically, this tokenizer defers to Acorn's JavaScript parser when
 * encountering a `{` character for an attribute value or within a text
 * node. Acorn parses the expression, and the tokenizer continues its work
 * following the closing `}`.
 *
 * The tokenizer itself is a massive state machine - code points are consumed one at
 * a time and, when certain conditions are met, sequences of those code points are
 * emitted as tokens. The tokenizer will also transition to new states, under conditions
 * specified by the HTML spec.
 */
class TemplateHtmlTokenizer extends Tokenizer {
    parser: TemplateHtmlParser;
    // We track which attribute values are in-progess so that we can defer
    // to the default tokenizer's behavior after the first character of
    // an unquoted attr value has been checked for an opening curly brace.
    checkedAttrs = new WeakSet<any>();

    constructor(parser: TemplateHtmlParser) {
        super();
        this.parser = parser;
    }

    // Move the lexer's cursor forward by the indicated number of positions. This
    // mechanism is superior to setting `this.preprocessor.pos` because it allows
    // parse5's location mixin to count new lines and columns, resulting in correct
    // AST location information.
    advanceBy(numChars: number) {
        for (let i = 0; i < numChars; i++) {
            this.preprocessor.advance();
        }
    }

    parseTemplateExpression() {
        const expressionStart: number = this.preprocessor.pos;
        const html = this.preprocessor.html as string;

        const leadingWhitespaceLen = getWhitespaceLen(html.slice(expressionStart + 1));
        const javascriptExprStart = expressionStart + leadingWhitespaceLen + OPENING_CURLY_LEN;

        // Start parsing after the opening curly brace and any leading whitespace.
        const estreeNode = parseExpressionAt(html, javascriptExprStart, {
            ecmaVersion: TMPL_EXPR_ECMASCRIPT_EDITION,
            allowAwaitOutsideFunction: true,
            locations: true,
            ranges: true,
            onComment: () => invariant(false, ParserDiagnostics.INVALID_EXPR_COMMENTS_DISALLOWED),
        });

        const leadingChars = html.slice(expressionStart + 1, estreeNode.start);
        const trailingChars = getTrailingChars(html.slice(estreeNode.end));
        validateMatchingExtraParens(leadingChars, trailingChars);
        const idxOfClosingBracket = estreeNode.end + trailingChars.length;
        // Capture text content between the outer curly braces, inclusive.
        const expressionTextNodeValue = html.slice(
            expressionStart,
            idxOfClosingBracket + CLOSING_CURLY_LEN
        );

        invariant(
            html.codePointAt(idxOfClosingBracket) === CLOSING_CURLY_BRACKET,
            ParserDiagnostics.TEMPLATE_EXPRESSION_PARSING_ERROR,
            ['expression must end with curly brace.']
        );

        this.advanceBy(expressionTextNodeValue.length);

        // Parsed expressions that are cached here will be later retrieved when the
        // LWC template AST is being constructed.
        this.parser.preparsedJsExpressions.set(expressionStart, estreeNode);

        return expressionTextNodeValue;
    }

    // ATTRIBUTE_VALUE_UNQUOTED_STATE is entered when an opening tag is being parsed,
    // after an attribute name is parsed, and after the `=` character is parsed. The
    // next character determines whether the lexer enters the ATTRIBUTE_VALUE_QUOTED_STATE
    // or ATTRIBUTE_VALUE_UNQUOTED_STATE. Customizations required to support template
    // expressions are only in effect when parsing an unquoted attribute value.
    ATTRIBUTE_VALUE_UNQUOTED_STATE(codePoint: number) {
        if (codePoint === OPENING_CURLY_BRACKET && !this.checkedAttrs.has(this.currentAttr)) {
            this.checkedAttrs.add(this.currentAttr);
            this.currentAttr!.value = this.parseTemplateExpression();
            // Moving the cursor back by one allows the state machine to correctly detect
            // the state into which it should next transition.
            this._unconsume();
        } else {
            // If the first character in an unquoted-attr-value is not an opening
            // curly brace, it isn't a template expression. Opening curly braces
            // coming later in an unquoted attr value should not be considered
            // the beginning of a template expression.
            this.checkedAttrs.add(this.currentAttr);
            super.ATTRIBUTE_VALUE_UNQUOTED_STATE(codePoint);
        }
    }

    // DATA_STATE is the initial & default state of the lexer. It can be thought of as the
    // state when the cursor is outside of an (opening or closing) tag, and outside of
    // special parts of an HTML document like the contents of a <style> or <script> tag.
    // In other words, we're parsing a text node when in DATA_STATE.
    DATA_STATE(codePoint: number) {
        if (codePoint === OPENING_CURLY_BRACKET) {
            // An opening curly brace may be the first character in a text node.
            // If that is not the case, we need to emit the text node characters
            // that come before the curly brace.
            if (this.currentCharacterToken) {
                // Emit the text segment preceding the curly brace.
                this._emitCurrentCharacterToken();
            }

            const expressionTextNodeValue = this.parseTemplateExpression();

            // Create a new text-node token to contain our `{expression}`
            this._createCharacterToken(Tokenizer.CHARACTER_TOKEN, expressionTextNodeValue);

            // Emit the text node token containing the `{expression}`
            this._emitCurrentCharacterToken();

            // Moving the cursor back by one allows the state machine to correctly detect
            // the state into which it should next transition.
            this._unconsume();
        } else {
            super.DATA_STATE(codePoint);
        }
    }
}

interface TemplateHtmlParserOptions extends ParserOptions {
    preparsedJsExpressions: PreparsedExpressionMap;
}

/**
 * This class extends `parse5`'s internal parser. The heavy lifting is
 * done in the tokenizer. This class is only present to facilitate use
 * of that tokenizer when parsing expressions.
 */
class TemplateHtmlParser extends Parser {
    preparsedJsExpressions: PreparsedExpressionMap;
    tokenizer!: TemplateHtmlTokenizer;

    constructor(_options: TemplateHtmlParserOptions) {
        const { preparsedJsExpressions, ...options } = _options;
        super(options);
        this.preparsedJsExpressions = preparsedJsExpressions;
    }

    _bootstrap(document: Document, fragmentContext: any) {
        super._bootstrap(document, fragmentContext);
        // The default `_bootstrap` method creates a new Tokenizer; here, we ensure that our
        // customized tokenizer is used.
        this.tokenizer = new TemplateHtmlTokenizer(this);
    }

    // The parser will try to concatenate adjacent text tokens into a single
    // text node. Template expressions should be encapsulated in their own
    // text node, and not combined with adjacent text or whitespace. To avoid
    // that, we create a new text node for the template expression rather than
    // allowing the concatenation to proceed.
    _insertCharacters(token: any) {
        if (token.chars[0] !== '{') {
            return super._insertCharacters(token);
        }
        const parentNode = this.openElements.current;
        const textNode: TextNode = {
            nodeName: '#text',
            value: token.chars,
            sourceCodeLocation: token.location,
            parentNode,
        };
        parentNode.childNodes.push(textNode);
    }
}

interface ParseFragmentConfig {
    ctx: ParserCtx;
    sourceCodeLocationInfo: boolean;
    onParseError: (error: ParserError) => void;
}

/**
 * Parse the LWC template using a customized parser & lexer that allow
 * for template expressions to be parsed correctly.
 *
 * @param      {string}               source  raw template markup
 * @param      {ParseFragmentConfig}  config
 *
 * @return     {DocumentFragment}     the parsed document
 */
export function parseFragment(source: string, config: ParseFragmentConfig): DocumentFragment {
    const { ctx, sourceCodeLocationInfo = true, onParseError } = config;

    const parser = new TemplateHtmlParser({
        sourceCodeLocationInfo,
        onParseError,
        preparsedJsExpressions: ctx.preparsedJsExpressions!,
    });

    return parser.parseFragment(source);
}
