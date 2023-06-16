/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// For the full list of parse5 error codes, see:
// https://github.com/inikulin/parse5/blob/ad2148d/packages/parse5/lib/common/error-codes.js
export const errorCodesToErrorOn = new Set([
    'control-character-in-input-stream',
    'noncharacter-in-input-stream',
    'surrogate-in-input-stream',
    'non-void-html-element-start-tag-with-trailing-solidus',
    'end-tag-with-attributes',
    'end-tag-with-trailing-solidus',
    'unexpected-solidus-in-tag',
    'unexpected-null-character',
    'unexpected-question-mark-instead-of-tag-name',
    'invalid-first-character-of-tag-name',
    'unexpected-equals-sign-before-attribute-name',
    'missing-end-tag-name',
    'unexpected-character-in-attribute-name',
    'unknown-named-character-reference',
    'missing-semicolon-after-character-reference',
    'unexpected-character-after-doctype-system-identifier',
    'unexpected-character-in-unquoted-attribute-value',
    'eof-before-tag-name',
    'eof-in-tag',
    'missing-attribute-value',
    'missing-whitespace-between-attributes',
    'missing-whitespace-after-doctype-public-keyword',
    'missing-whitespace-between-doctype-public-and-system-identifiers',
    'missing-whitespace-after-doctype-system-keyword',
    'missing-quote-before-doctype-public-identifier',
    'missing-quote-before-doctype-system-identifier',
    'missing-doctype-public-identifier',
    'missing-doctype-system-identifier',
    'abrupt-doctype-public-identifier',
    'abrupt-doctype-system-identifier',
    'cdata-in-html-content',
    'incorrectly-opened-comment',
    'eof-in-script-html-comment-like-text',
    'eof-in-doctype',
    'nested-comment',
    'abrupt-closing-of-empty-comment',
    'eof-in-comment',
    'incorrectly-closed-comment',
    'eof-in-cdata',
    'absence-of-digits-in-numeric-character-reference',
    'null-character-reference',
    'surrogate-character-reference',
    'character-reference-outside-unicode-range',
    'control-character-reference',
    'noncharacter-character-reference',
    'missing-whitespace-before-doctype-name',
    'missing-doctype-name',
    'invalid-character-sequence-after-doctype-name',
    'duplicate-attribute',
]);

// These were added between parse5-with-errors v4.0.4 and parse5 v6.0.1
export const errorCodesToWarnOnInOlderAPIVersions = new Set([
    'non-conforming-doctype',
    'missing-doctype',
    'misplaced-doctype',
    'end-tag-without-matching-open-element',
    'closing-of-element-with-open-child-elements',
    'disallowed-content-in-noscript-in-head',
    'open-elements-left-after-eof',
    'abandoned-head-element-child',
    'misplaced-start-tag-for-head-element',
    'nested-noscript-in-head',
    'eof-in-element-that-can-contain-only-text',
]);
