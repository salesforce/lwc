import { VNodes } from "../3rdparty/snabbdom/types";
import { patchEvent } from "../faux-shadow/faux";
import { tagNameGetter } from "../env/element";
import { updateDynamicChildren, updateStaticChildren } from "../3rdparty/snabbdom/snabbdom";
import { setPrototypeOf, create, isUndefined, isTrue } from "../shared/language";
import { ComponentDef } from "./def";
import { HTMLElementConstructor } from "./base-bridge-element";
import { PatchedElement, PatchedSlotElement, PatchedNode, PatchedIframeElement, PatchedCustomElement, markElementAsPortal, setCSSToken } from '../faux-shadow/faux';

// Using a WeakMap instead of a WeakSet because this one works in IE11 :(
const FromIteration: WeakMap<VNodes, 1> = new WeakMap();

// dynamic children means it was generated by an iteration
// in a template, and will require a more complex diffing algo.
export function markAsDynamicChildren(children: VNodes) {
    FromIteration.set(children, 1);
}

export function hasDynamicChildren(children: VNodes): boolean {
    return FromIteration.has(children);
}

export function patchChildren(host: Element, shadowRoot: ShadowRoot, oldCh: VNodes, newCh: VNodes, isFallback: boolean) {
    if (oldCh !== newCh) {
        const parentNode = isFallback ? host : shadowRoot;
        const fn = hasDynamicChildren(newCh) ? updateDynamicChildren : updateStaticChildren;
        fn(parentNode, oldCh, newCh);
    }
}

let TextNodeProto: object;

// this method is supposed to be invoked when in fallback mode only
// to patch text nodes generated by a template.
export function patchTextNodeProto(text: Text) {
    if (isUndefined(TextNodeProto)) {
        TextNodeProto = PatchedNode(text).prototype;
    }
    setPrototypeOf(text, TextNodeProto);
}

let CommentNodeProto: object;

// this method is supposed to be invoked when in fallback mode only
// to patch comment nodes generated by a template.
export function patchCommentNodeProto(comment: Comment) {
    if (isUndefined(CommentNodeProto)) {
        CommentNodeProto = PatchedNode(comment).prototype;
    }
    setPrototypeOf(comment, CommentNodeProto);
}

const TagToProtoCache: Record<string, object> = create(null);

function getPatchedElementClass(elm: HTMLElement): HTMLElementConstructor {
    switch (tagNameGetter.call(elm)) {
        case 'SLOT':
            return PatchedSlotElement(elm as HTMLSlotElement);
        case 'IFRAME':
            return PatchedIframeElement(elm as HTMLIFrameElement);
    }
    return PatchedElement(elm);
}

// this method is supposed to be invoked when in fallback mode only
// to patch elements generated by a template.
export function patchElementProto(elm: HTMLElement, options: { sel: string, portal: boolean, shadowAttribute?: string }) {
    const { sel, portal, shadowAttribute } = options;
    let proto = TagToProtoCache[sel];
    if (isUndefined(proto)) {
        proto = TagToProtoCache[sel] = getPatchedElementClass(elm).prototype;
    }
    setPrototypeOf(elm, proto);
    if (isTrue(portal)) {
        markElementAsPortal(elm);
    }
    setCSSToken(elm, shadowAttribute);
}

// since the proto chain is unique per constructor,
// we can just store it inside the `def`
interface PatchedComponentDef extends ComponentDef {
    patchedBridge?: HTMLElementConstructor;
}

export function patchCustomElementProto(elm: HTMLElement, options: { def: ComponentDef, shadowAttribute?: string }) {
    const { def, shadowAttribute } = options;
    let patchedBridge = (def as PatchedComponentDef).patchedBridge;
    if (isUndefined(patchedBridge)) {
        patchedBridge = (def as PatchedComponentDef).patchedBridge = PatchedCustomElement(elm);
    }
    // temporary patching the proto, eventually this should be just more nodes in the proto chain
    setPrototypeOf(elm, patchedBridge.prototype);
    setCSSToken(elm, shadowAttribute);
}

export {
    patchEvent,
};
