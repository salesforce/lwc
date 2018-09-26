import { elementsFromPoint } from "../../faux-shadow/document";
import { getNodeOwnerKey } from "../../framework/vm";
import { isUndefined } from "../../shared/language";

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
}
