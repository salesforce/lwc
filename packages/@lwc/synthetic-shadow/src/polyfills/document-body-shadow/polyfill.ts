/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    getElementsByClassName as elementGetElementsByClassName,
    getElementsByTagName as elementGetElementsByTagName,
    getElementsByTagNameNS as elementGetElementsByTagNameNS,
    querySelectorAll as elementQuerySelectorAll,
} from '../../env/element';
import {
    ArrayFilter,
    ArrayFind,
    ArraySlice,
    defineProperty,
    isTrue,
    isUndefined,
} from '../../shared/language';
import { getNodeOwnerKey } from '../../faux-shadow/node';
import { createStaticNodeList } from '../../shared/static-node-list';
import { createStaticHTMLCollection } from '../../shared/static-html-collection';

export default function apply() {
    // Inside the apply() so that we fetch the value only when the polyfill is run
    // Also helps to cache the flag value
    let skipGlobalPatching: boolean;
    function isGlobalPatchingSkipped() {
        if (isUndefined(skipGlobalPatching)) {
            skipGlobalPatching =
                document.body.getAttribute('data-global-patching-skipped-temporarily') ===
                'clock-is-ticking';
        }
        return isTrue(skipGlobalPatching);
    }

    const HTMLBodyElementPrototype = HTMLBodyElement.prototype;
    // The following patched methods hide shadowed elements from global
    // traversing mechanisms. They are simplified for performance reasons to
    // filter by ownership and do not account for slotted elements. This
    // compromise is fine for our synthetic shadow dom because root elements
    // cannot have slotted elements.
    // Another compromise here is that all these traversing methods will return
    // static HTMLCollection or static NodeList. We decided that this compromise
    // is not a big problem considering the amount of code that is relying on
    // the liveliness of these results are rare.

    defineProperty(HTMLBodyElementPrototype, 'querySelector', {
        value(this: HTMLBodyElement): Element | null {
            const elements = elementQuerySelectorAll.apply(this, ArraySlice.call(arguments) as [
                string
            ]);
            const ownerKey = getNodeOwnerKey(this);
            // Return the first non shadow element
            const filtered = ArrayFind.call(
                elements,
                elm => getNodeOwnerKey(elm) === ownerKey || isGlobalPatchingSkipped()
            );
            return !isUndefined(filtered) ? filtered : null;
        },
        writable: true,
        enumerable: true,
        configurable: true,
    });

    defineProperty(HTMLBodyElementPrototype, 'querySelectorAll', {
        value(this: HTMLBodyElement): NodeListOf<Element> {
            const elements = elementQuerySelectorAll.apply(this, ArraySlice.call(arguments) as [
                string
            ]);
            const ownerKey = getNodeOwnerKey(this);
            const filtered = ArrayFilter.call(
                elements,
                elm => getNodeOwnerKey(elm) === ownerKey || isGlobalPatchingSkipped()
            );
            return createStaticNodeList(filtered);
        },
        writable: true,
        enumerable: true,
        configurable: true,
    });

    defineProperty(HTMLBodyElementPrototype, 'getElementsByClassName', {
        value(this: HTMLBodyElement): HTMLCollectionOf<Element> {
            const elements = elementGetElementsByClassName.apply(this, ArraySlice.call(
                arguments
            ) as [string]);
            const ownerKey = getNodeOwnerKey(this);
            const filtered = ArrayFilter.call(
                elements,
                elm => getNodeOwnerKey(elm) === ownerKey || isGlobalPatchingSkipped()
            );
            return createStaticHTMLCollection(filtered);
        },
        writable: true,
        enumerable: true,
        configurable: true,
    });

    defineProperty(HTMLBodyElementPrototype, 'getElementsByTagName', {
        value(this: HTMLBodyElement): NodeListOf<Element> {
            const elements = elementGetElementsByTagName.apply(this, ArraySlice.call(arguments) as [
                string
            ]);
            const ownerKey = getNodeOwnerKey(this);
            const filtered = ArrayFilter.call(
                elements,
                elm => getNodeOwnerKey(elm) === ownerKey || isGlobalPatchingSkipped()
            );
            // NodeList because of https://bugzilla.mozilla.org/show_bug.cgi?id=14869
            return createStaticNodeList(filtered);
        },
        writable: true,
        enumerable: true,
        configurable: true,
    });

    defineProperty(HTMLBodyElementPrototype, 'getElementsByTagNameNS', {
        value(this: HTMLBodyElement): NodeListOf<Element> {
            const elements = elementGetElementsByTagNameNS.apply(this, ArraySlice.call(
                arguments
            ) as [string, string]);
            const ownerKey = getNodeOwnerKey(this);
            const filtered = ArrayFilter.call(
                elements,
                elm => getNodeOwnerKey(elm) === ownerKey || isGlobalPatchingSkipped()
            );
            // NodeList because of https://bugzilla.mozilla.org/show_bug.cgi?id=14869
            return createStaticNodeList(filtered);
        },
        writable: true,
        enumerable: true,
        configurable: true,
    });
}
