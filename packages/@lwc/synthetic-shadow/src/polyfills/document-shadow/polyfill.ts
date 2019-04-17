/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { elementFromPoint, DocumentPrototypeActiveElement } from '../../env/document';
import { isNull, isUndefined, defineProperty } from '../../shared/language';
import { getNodeOwnerKey } from '../../faux-shadow/node';
import { parentElementGetter } from '../../env/node';
import { retarget } from '../../3rdparty/polymer/retarget';
import { pathComposer } from '../../3rdparty/polymer/path-composer';

export default function apply() {
    function elemFromPoint(left: number, top: number): Element | null {
        const element = elementFromPoint.call(document, left, top);
        if (isNull(element)) {
            return element;
        }

        return retarget(document, pathComposer(element, true)) as (Element | null);
    }

    // https://github.com/Microsoft/TypeScript/issues/14139
    document.elementFromPoint = elemFromPoint as (left: number, top: number) => Element;

    // Go until we reach to top of the LWC tree
    defineProperty(document, 'activeElement', {
        get(): Element | null {
            let node = DocumentPrototypeActiveElement.call(this);

            if (isNull(node)) {
                return node;
            }

            while (!isUndefined(getNodeOwnerKey(node as Node))) {
                node = parentElementGetter.call(node);
                if (isNull(node)) {
                    return null;
                }
            }
            if (node.tagName === 'HTML') {
                // IE 11. Active element should never be html element
                node = document.body;
            }

            return node;
        },
        enumerable: true,
        configurable: true,
    });
}
