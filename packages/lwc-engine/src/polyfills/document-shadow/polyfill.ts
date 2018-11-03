import { elementsFromPoint, DocumentPrototypeActiveElement } from "../../faux-shadow/document";
import { getNodeOwnerKey } from "../../framework/vm";
import { isUndefined, defineProperty } from "../../shared/language";
import { parentElementGetter } from "../../framework/dom-api";

export default function apply() {
    function elemFromPoint(left: number, top: number): Element | null {
        const elements = elementsFromPoint.call(document, left, top);
        const { length } = elements;
        let match = null;
        for (let i = length - 1; i >= 0; i -= 1) {
            const el = elements[i];
            const ownerKey = getNodeOwnerKey(el);
            if (isUndefined(ownerKey)) {
                match = elements[i];
            }
        }
        return match;
    }

    // https://github.com/Microsoft/TypeScript/issues/14139
    document.elementFromPoint = elemFromPoint as (left: number, top: number) => Element;

    // Go until we reach to top of the LWC tree
    defineProperty(document, 'activeElement', {
        get() {
            const active = DocumentPrototypeActiveElement.call(this);
            let node = active;
            while (!isUndefined(getNodeOwnerKey(node))) {
                node = parentElementGetter.call(node);
            }
            if (node.tagName === 'HTML') { // IE 11. Active element should never be html element
                node = document.body;
            }
            return node;
        },
        enumerable: true,
        configurable: true,
    });
}
