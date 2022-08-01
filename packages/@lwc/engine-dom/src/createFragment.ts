/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from '@lwc/shared';

const SUPPORTS_TEMPLATE = typeof HTMLTemplateElement === 'function';

export let createFragment: (html: string) => Node | null;

if (SUPPORTS_TEMPLATE) {
    // Parse the fragment HTML string into DOM
    createFragment = function (html: string) {
        const template = document.createElement('template');
        template.innerHTML = html;
        return template.content.firstChild;
    };
} else {
    // In browsers that don't support <template> (e.g. IE11), we need to be careful to wrap elements like
    // <td> in the proper container elements (e.g. <tbody>), because otherwise they will be parsed as null.

    // Via https://github.com/webcomponents/polyfills/blob/ee1db33/packages/template/template.js#L273-L280
    // With other elements added from:
    // https://github.com/sindresorhus/html-tags/blob/95dcdd5/index.js
    // Using the test:
    // document.createRange().createContextualFragment(`<${tag}></${tag}>`).firstChild === null
    // And omitting <html>, <head>, and <body> as these are not practical in an LWC component.
    const topLevelWrappingMap: { [key: string]: string[] } = {
        caption: ['table'],
        col: ['colgroup', 'table'],
        colgroup: ['table'],
        option: ['select'],
        tbody: ['table'],
        td: ['tr', 'tbody', 'table'],
        th: ['tr', 'tbody', 'table'],
        thead: ['table'],
        tfoot: ['table'],
        tr: ['tbody', 'table'],
    };

    // Via https://github.com/webcomponents/polyfills/blob/ee1db33/packages/template/template.js#L282-L288
    const getTagName = function (text: string) {
        return (/<([a-z][^/\0>\x20\t\r\n\f]+)/i.exec(text) || ['', ''])[1].toLowerCase();
    };

    // Via https://github.com/webcomponents/polyfills/blob/ee1db33/packages/template/template.js#L295-L320
    createFragment = function (html: string) {
        const wrapperTags = topLevelWrappingMap[getTagName(html)];
        if (!isUndefined(wrapperTags)) {
            for (const wrapperTag of wrapperTags) {
                html = `<${wrapperTag}>${html}</${wrapperTag}>`;
            }
        }

        // For IE11, the document title must not be undefined, but it can be an empty string
        // https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createHTMLDocument#browser_compatibility
        const doc = document.implementation.createHTMLDocument('');
        doc.body.innerHTML = html;

        let content: Node = doc.body;
        if (!isUndefined(wrapperTags)) {
            for (let i = 0; i < wrapperTags.length; i++) {
                content = content.firstChild!;
            }
        }

        return content.firstChild;
    };
}
