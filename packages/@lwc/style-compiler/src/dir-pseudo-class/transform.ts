/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { attribute, combinator, Root, Selector, isCombinator } from 'postcss-selector-parser';

import { isDirPseudoClass } from '../utils/rtl';

function isValidDirValue(value: string): boolean {
    return value === 'ltr' || value === 'rtl';
}

export default function(root: Root) {
    root.nodes.forEach(node => {
        const selector = node as Selector;
        selector.nodes.forEach(node => {
            if (!isDirPseudoClass(node)) {
                return;
            }

            const value = node.nodes.toString().trim();
            if (!isValidDirValue(value)) {
                throw root.error(
                    `:dir() pseudo class expects "ltr" or "rtl" for value, but received "${value}".`,
                    {
                        index: node.sourceIndex,
                        word: node.value,
                    }
                );
            }

            // Remove the :dir pseudo class from the selector.
            node.remove();

            // If the selector is not empty and if the first node in the selector is not already a
            // " " combinator. We need to add in front of the selector a " " selector before adding
            // the converted dir attribute.
            const shouldInsertSpace =
                selector.first && !isCombinator(selector.first) && selector.first.value !== ' ';
            if (shouldInsertSpace) {
                selector.insertBefore(
                    selector.first,
                    combinator({
                        value: ' ',
                    })
                );
            }

            // Add the dir attribute in front of the selector.
            selector.insertBefore(
                selector.first,
                attribute({
                    attribute: 'dir',
                    operator: '=',
                    quoteMark: '"',
                    value: `"${value}"`,
                    raws: {},
                })
            );
        });
    });
}
