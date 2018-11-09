import {
    create,
    isUndefined,
    forEach,
    getPropertyDescriptor,
} from "../shared/language";
import { defaultDefHTMLPropertyNames } from "./attributes";
import { ElementPrototypeAriaPropertyNames } from '../polyfills/aria-properties/main';

// Initialization Routines
import "../polyfills/patch-event/main";
import "../polyfills/document-shadow/main";
import "../polyfills/shadow-root/main";
import "../polyfills/proxy-concat/main";
import "../polyfills/aria-properties/main";

/**
 * This is a descriptor map that contains
 * all standard properties that a Custom Element can support (including AOM properties), which
 * determines what kind of capabilities the Base HTML Element and
 * Base Lightning Element should support.
 */
export const HTMLElementOriginalDescriptors: PropertyDescriptorMap = create(null);

forEach.call(ElementPrototypeAriaPropertyNames, (propName: string) => {
    // Note: intentionally using our in-house getPropertyDescriptor instead of getOwnPropertyDescriptor here because
    // in IE11, some properties are on Element.prototype instead of HTMLElement, just to be sure.
    const descriptor = getPropertyDescriptor(HTMLElement.prototype, propName);
    if (!isUndefined(descriptor)) {
        HTMLElementOriginalDescriptors[propName] = descriptor;
    }
});
forEach.call(defaultDefHTMLPropertyNames, (propName) => {
    // Note: intentionally using our in-house getPropertyDescriptor instead of getOwnPropertyDescriptor here because
    // in IE11, id property is on Element.prototype instead of HTMLElement, and we suspect that more will fall into
    // this category, so, better to be sure.
    const descriptor = getPropertyDescriptor(HTMLElement.prototype, propName);
    if (!isUndefined(descriptor)) {
        HTMLElementOriginalDescriptors[propName] = descriptor;
    }
});
