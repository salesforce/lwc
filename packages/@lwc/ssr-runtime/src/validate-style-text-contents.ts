/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * Per the HTML spec on restrictions for "raw text elements" like `<style>`:
 *
 * > The text in raw text and escapable raw text elements must not contain any occurrences of the string
 * > "</" (U+003C LESS-THAN SIGN, U+002F SOLIDUS) followed by characters that case-insensitively match the tag name of
 * > the element followed by one of:
 * > - U+0009 CHARACTER TABULATION (tab)
 * > - U+000A LINE FEED (LF)
 * > - U+000C FORM FEED (FF)
 * > - U+000D CARRIAGE RETURN (CR)
 * > - U+0020 SPACE
 * > - U+003E GREATER-THAN SIGN (>), or
 * > - U+002F SOLIDUS (/)
 * @see https://html.spec.whatwg.org/multipage/syntax.html#cdata-rcdata-restrictions
 */
const INVALID_STYLE_CONTENT = /<\/style[\t\n\f\r >/]/i;

/**
 * The text content inside `<style>` is a special case. It is _only_ rendered by the LWC engine itself; `<style>` tags
 * are disallowed inside of HTML templates.
 *
 * The `<style>` tag is unusual in how it's defined in HTML. Like `<script>`, it is considered a "raw text element,"
 * which means that it is parsed as raw text, but certain character sequences are disallowed, namely to avoid XSS
 * attacks like `</style><script>alert("pwned")</script>`.
 *
 * This also means that we cannot use "normal" HTML escaping inside `<style>` tags, e.g. we cannot use `&lt;`,
 * `&gt;`, etc., because these are treated as-is by the HTML parser.
 *
 *
 * @param contents CSS source to validate
 * @throws Throws if the contents provided are not valid.
 * @see https://html.spec.whatwg.org/multipage/syntax.html#raw-text-elements
 * @see https://github.com/salesforce/lwc/issues/3439
 * @example
 * validateStyleTextContents('div { color: red }') // Ok
 * validateStyleTextContents('</style><script>alert("pwned")</script>') // Throws
 */
export function validateStyleTextContents(contents: string): void {
    if (INVALID_STYLE_CONTENT.test(contents)) {
        throw new Error(
            'CSS contains unsafe characters and cannot be serialized inside a style element'
        );
    }
}
