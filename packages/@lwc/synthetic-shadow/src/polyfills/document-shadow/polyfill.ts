/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    elementFromPoint,
    DocumentPrototypeActiveElement,
    getElementById as documentGetElementById,
    getElementsByClassName as documentGetElementsByClassName,
    getElementsByName,
    getElementsByTagName as documentGetElementsByTagName,
    getElementsByTagNameNS as documentGetElementsByTagNameNS,
    querySelectorAll as documentQuerySelectorAll,
} from '../../env/document';
import {
    ArrayFilter,
    ArrayFind,
    ArraySlice,
    defineProperty,
    isNull,
    isUndefined,
    getOwnPropertyDescriptor,
} from '../../shared/language';
import { getNodeOwnerKey } from '../../faux-shadow/node';
import { parentElementGetter } from '../../env/node';
import { retarget } from '../../3rdparty/polymer/retarget';
import { pathComposer } from '../../3rdparty/polymer/path-composer';
import { createStaticNodeList } from '../../shared/static-node-list';
import { createStaticHTMLCollection } from '../../shared/static-html-collection';
import { isGlobalPatchingSkipped } from '../../shared/utils';

export default function apply() {
    function elemFromPoint(this: Document, left: number, top: number) {
        const element = elementFromPoint.call(this, left, top);
        if (isNull(element)) {
            return element;
        }

        return retarget(this, pathComposer(element, true)) as Element | null;
    }

    // https://github.com/Microsoft/TypeScript/issues/14139
    Document.prototype.elementFromPoint = elemFromPoint as (left: number, top: number) => Element;

    // Go until we reach to top of the LWC tree
    defineProperty(Document.prototype, 'activeElement', {
        get(this: Document): Element | null {
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
                node = this.body;
            }

            return node;
        },
        enumerable: true,
        configurable: true,
    });

    // The following patched methods hide shadowed elements from global
    // traversing mechanisms. They are simplified for performance reasons to
    // filter by ownership and do not account for slotted elements. This
    // compromise is fine for our synthetic shadow dom because root elements
    // cannot have slotted elements.
    // Another compromise here is that all these traversing methods will return
    // static HTMLCollection or static NodeList. We decided that this compromise
    // is not a big problem considering the amount of code that is relying on
    // the liveliness of these results are rare.

    defineProperty(Document.prototype, 'getElementById', {
        value(this: Document): Element | null {
            const elm = documentGetElementById.apply(this, ArraySlice.call(arguments) as [string]);
            if (isNull(elm)) {
                return null;
            }
            return isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(elm) ? elm : null;
        },
        writable: true,
        enumerable: true,
        configurable: true,
    });

    defineProperty(Document.prototype, 'querySelector', {
        value(this: Document): Element | null {
            const elements = documentQuerySelectorAll.apply(this, ArraySlice.call(arguments) as [
                string
            ]);
            const filtered = ArrayFind.call(
                elements,
                elm => isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(elm)
            );
            return !isUndefined(filtered) ? filtered : null;
        },
        writable: true,
        enumerable: true,
        configurable: true,
    });

    defineProperty(Document.prototype, 'querySelectorAll', {
        value(this: Document): NodeListOf<Element> {
            const elements = documentQuerySelectorAll.apply(this, ArraySlice.call(arguments) as [
                string
            ]);
            const filtered = ArrayFilter.call(
                elements,
                elm => isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(elm)
            );
            return createStaticNodeList(filtered);
        },
        writable: true,
        enumerable: true,
        configurable: true,
    });

    defineProperty(Document.prototype, 'getElementsByClassName', {
        value(this: Document): HTMLCollectionOf<Element> {
            const elements = documentGetElementsByClassName.apply(this, ArraySlice.call(
                arguments
            ) as [string]);
            const filtered = ArrayFilter.call(
                elements,
                elm => isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(elm)
            );
            return createStaticHTMLCollection(filtered);
        },
        writable: true,
        enumerable: true,
        configurable: true,
    });

    defineProperty(Document.prototype, 'getElementsByTagName', {
        value(this: Document): HTMLCollectionOf<Element> {
            const elements = documentGetElementsByTagName.apply(this, ArraySlice.call(
                arguments
            ) as [string]);
            const filtered = ArrayFilter.call(
                elements,
                elm => isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(elm)
            );
            return createStaticHTMLCollection(filtered);
        },
        writable: true,
        enumerable: true,
        configurable: true,
    });

    defineProperty(Document.prototype, 'getElementsByTagNameNS', {
        value(this: Document): HTMLCollectionOf<Element> {
            const elements = documentGetElementsByTagNameNS.apply(this, ArraySlice.call(
                arguments
            ) as [string, string]);
            const filtered = ArrayFilter.call(
                elements,
                elm => isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(elm)
            );
            return createStaticHTMLCollection(filtered);
        },
        writable: true,
        enumerable: true,
        configurable: true,
    });

    defineProperty(
        // In Firefox v57 and lower, getElementsByName is defined on HTMLDocument.prototype
        getOwnPropertyDescriptor(HTMLDocument.prototype, 'getElementsByName')
            ? HTMLDocument.prototype
            : Document.prototype,
        'getElementsByName',
        {
            value(this: Document): NodeListOf<Element> {
                const elements = getElementsByName.apply(this, ArraySlice.call(arguments) as [
                    string
                ]);
                const filtered = ArrayFilter.call(
                    elements,
                    elm => isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(elm)
                );
                return createStaticNodeList(filtered);
            },
            writable: true,
            enumerable: true,
            configurable: true,
        }
    );
}
