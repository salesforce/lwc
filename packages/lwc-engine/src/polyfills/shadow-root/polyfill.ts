import { SyntheticShadowRoot } from "../../faux-shadow/shadow-root";
import { elementsFromPoint } from "../../faux-shadow/document";
import { getNodeOwnerKey } from "../../framework/vm";
import { isUndefined } from "../../shared/language";

export default function apply() {
    (window as any).ShadowRoot = SyntheticShadowRoot;

    document.elementFromPoint = function (left: number, top: number): Element | null {
        const elements = elementsFromPoint.call(document, left, top);
        const { length } = elements;
        let match = null;
        for(let i = length - 1; i >= 0; i -= 1) {
            const el = elements[i];
            const ownerKey = getNodeOwnerKey(el);
            if (isUndefined(ownerKey)) {
                match = elements[i];
            }
        }
        return match;
    }
}
