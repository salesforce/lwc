import { elementsFromPoint, DocumentPrototypeActiveElement } from "../../env/document";
import { getNodeOwnerKey } from "../../framework/vm";
import { isNull, isUndefined, defineProperty } from "../../shared/language";
import { parentElementGetter } from "../../env/node";

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
            let node = DocumentPrototypeActiveElement.call(this);

            if (isNull(node)) {
                return node;
            }

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
