import assert from './assert';
import {
    StringToLowerCase,
    StringReplace,
    create,
    hasOwnProperty,
    forEach,
    getOwnPropertyNames,
    getOwnPropertyDescriptor,
    isUndefined,
    isNull,
    isTrue,
    defineProperties,
} from './language';
import { ViewModelReflection } from "./utils";
import { VM } from './vm';

const {
    dispatchEvent,
} = EventTarget.prototype;

const {
    addEventListener,
    removeEventListener,
    getAttribute,
    getAttributeNS,
    setAttribute,
    setAttributeNS,
    removeAttribute,
    removeAttributeNS,
    querySelector,
    querySelectorAll,
} = Element.prototype;

const {
    DOCUMENT_POSITION_CONTAINED_BY
} = Node;

const {
    compareDocumentPosition,
} = Node.prototype;

const parentNodeGetter = getOwnPropertyDescriptor(Node.prototype, 'parentNode')!.get!;
const parentElementGetter = getOwnPropertyDescriptor(Node.prototype, 'parentElement')!.get!;

/**
 * Returns the context shadow included root.
 */
function findShadowRoot(node: Node): Node {
    const initialParent = parentNodeGetter.call(node);
    // We need to ensure that the parent element is present before accessing it.
    if (isNull(initialParent)) {
        return node;
    }

    // In the case of LWC, the root and the host element are the same things. Therefor,
    // when calling findShadowRoot on the a host element we want to return the parent host
    // element and not the current host element.
    node = initialParent;
    let nodeParent;
    while (
        !isNull(nodeParent = parentNodeGetter.call(node)) &&
        isUndefined(node[ViewModelReflection])
    ) {
        node = nodeParent;
    }

    return node;

}

/**
 * Returns the context root beyond the shadow root.
 *
 * It doesn't returns actually the root but the host. This approximation is sufficiant
 * in our case.
 */
function findComposedRootNode(node: Node): Node {
    let nodeParent;
    while (!isNull(nodeParent = parentNodeGetter.call(node))) {
        node = nodeParent;
    }

    return node;
}

/**
 * Dummy implementation of the Node.prototype.getRootNode.
 * Spec: https://dom.spec.whatwg.org/#dom-node-getrootnode
 *
 * TODO: Once we start using the real shadowDOM, this method should be replaced by:
 * const { getRootNode } = Node.prototype;
 */
function getRootNode(
    this: Node,
    options?: { composed?: boolean }
): Node {
    const composed: boolean = isUndefined(options) ? false : !!options.composed;

    return isTrue(composed) ?
        findComposedRootNode(this) :
        findShadowRoot(this);
}

export const iFrameContentWindowGetter = getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow')!.get!;

export const EmptyNodeList = document.createElement('div').querySelectorAll('*');

export function isChildNode(root: Element, node: Node): boolean {
    return !!(compareDocumentPosition.call(root, node) & DOCUMENT_POSITION_CONTAINED_BY);
}

export {
    // EventTarget.prototype
    dispatchEvent,

    // Element.prototype
    addEventListener,
    removeEventListener,
    getAttribute,
    getAttributeNS,
    setAttribute,
    setAttributeNS,
    removeAttribute,
    removeAttributeNS,
    querySelector,
    querySelectorAll,

    // Node.prototype
    compareDocumentPosition,
    getRootNode,
    parentNodeGetter,
    parentElementGetter,

    // Node
    DOCUMENT_POSITION_CONTAINED_BY,
};

// These properties get added to LWCElement.prototype publicProps automatically
export const defaultDefHTMLPropertyNames = ['dir', 'id', 'accessKey', 'title', 'lang', 'hidden', 'draggable', 'tabIndex'];

// Few more exceptions that are using the attribute name to match the property in lowercase.
// this list was compiled from https://msdn.microsoft.com/en-us/library/ms533062(v=vs.85).aspx
// and https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
// Note: this list most be in sync with the compiler as well.
const HTMLPropertyNamesWithLowercasedReflectiveAttributes = [
    'accessKey',
    'readOnly',
    'tabIndex',
    'bgColor',
    'colSpan',
    'rowSpan',
    'contentEditable',
    'dateTime',
    'formAction',
    'isMap',
    'maxLength',
    'useMap',
];

// this regular expression is used to transform aria props into aria attributes because
// that doesn't follow the regular transformation process. e.g.: `aria-labeledby` <=> `ariaLabelBy`
const ARIA_REGEX = /^aria/;

export function attemptAriaAttributeFallback(vm: VM, attrName: string) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    // if the map is known (because all AOM attributes are known)
    if (hasOwnProperty.call(AttrNameToPropNameMap, attrName)) {
        const propName = AttrNameToPropNameMap[attrName];
        // and if the corresponding prop is an actual AOM property
        if (hasOwnProperty.call(GlobalAOMProperties, propName)) {
            vm.hostAttrs[attrName] = undefined; // marking the set is needed for the AOM polyfill
            const shadowValue = vm.cmpRoot![propName];
            if (shadowValue !== null) {
                setAttribute.call(vm.elm, attrName, shadowValue);
            }
        }
    }
}

// Global Aria and Role Properties derived from ARIA and Role Attributes with their
// respective default value.
// https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques
export const GlobalAOMProperties: Record<string, any> = {
    ariaAutoComplete: null,
    ariaChecked: null,
    ariaCurrent: null,
    ariaDisabled: null,
    ariaExpanded: null,
    ariaHasPopUp: null,
    ariaHidden: null,
    ariaInvalid: null,
    ariaLabel: null,
    ariaLevel: null,
    ariaMultiLine: null,
    ariaMultiSelectable: null,
    ariaOrientation: null,
    ariaPressed: null,
    ariaReadOnly: null,
    ariaRequired: null,
    ariaSelected: null,
    ariaSort: null,
    ariaValueMax: null,
    ariaValueMin: null,
    ariaValueNow: null,
    ariaValueText: null,
    ariaLive: null,
    ariaRelevant: null,
    ariaAtomic: null,
    ariaBusy: null,
    ariaActiveDescendant: null,
    ariaControls: null,
    ariaDescribedBy: null,
    ariaFlowTo: null,
    ariaLabelledBy: null,
    ariaOwns: null,
    ariaPosInSet: null,
    ariaSetSize: null,
    ariaColCount: null,
    ariaColIndex: null,
    ariaDetails: null,
    ariaErrorMessage: null,
    ariaKeyShortcuts: null,
    ariaModal: null,
    ariaPlaceholder: null,
    ariaRoleDescription: null,
    ariaRowCount: null,
    ariaRowIndex: null,
    ariaRowSpan: null,
    role: null,
};

const OffsetPropertiesError = 'This property will round the value to an integer, and it is considered an anti-pattern. Instead, you can use \`this.getBoundingClientRect()\` to obtain `left`, `top`, `right`, `bottom`, `x`, `y`, `width`, and `height` fractional values describing the overall border-box in pixels.';

// Global HTML Attributes & Properties
// https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement
export function getGlobalHTMLPropertiesInfo() {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    return {
        id: {
            attribute: 'id',
            reflective: true,
        },
        accessKey: {
            attribute: 'accesskey',
            reflective: true,
        },
        accessKeyLabel: {
            readOnly: true,
        },
        className: {
            attribute: 'class',
            error: `Using property "className" is an anti-pattern because of slow runtime behavior and conflicting with classes provided by the owner element. Instead use property "classList".`,
        },
        contentEditable: {
            attribute: 'contenteditable',
            reflective: true,
        },
        isContentEditable: {
            readOnly: true,
        },
        contextMenu: {
            attribute: 'contextmenu',
        },
        dataset: {
            readOnly: true,
            error: 'Using property "dataset" is an anti-pattern. Components should not rely on dataset to implement its internal logic, nor use that as a communication channel.',
        },
        dir: {
            attribute: 'dir',
            reflective: true,
        },
        draggable: {
            attribute: 'draggable',
            experimental: true,
            reflective: true,
        },
        dropzone: {
            attribute: 'dropzone',
            readOnly: true,
            experimental: true,
        },
        hidden: {
            attribute: 'hidden',
            reflective: true,
        },
        itemScope: {
            attribute: 'itemscope',
            experimental: true,
        },
        itemType: {
            attribute: 'itemtype',
            readOnly: true,
            experimental: true,
        },
        itemId: {
            attribute: 'itemid',
            experimental: true,
        },
        itemRef: {
            attribute: 'itemref',
            readOnly: true,
            experimental: true,
        },
        itemProp: {
            attribute: 'itemprop',
            readOnly: true,
            experimental: true,
        },
        itemValue: {
            experimental: true,
        },
        lang: {
            attribute: 'lang',
            reflective: true,
        },
        offsetHeight: {
            readOnly: true,
            error: OffsetPropertiesError,
        },
        offsetLeft: {
            readOnly: true,
            error: OffsetPropertiesError,
        },
        offsetParent: {
            readOnly: true,
        },
        offsetTop: {
            readOnly: true,
            error: OffsetPropertiesError,
        },
        offsetWidth: {
            readOnly: true,
            error: OffsetPropertiesError,
        },
        properties: {
            readOnly: true,
            experimental: true,
        },
        spellcheck: {
            experimental: true,
            reflective: true,
        },
        style: {
            attribute: 'style',
            error: `Using property or attribute "style" is an anti-pattern. Instead use property "classList".`,
        },
        tabIndex: {
            attribute: 'tabindex',
            reflective: true,
        },
        title: {
            attribute: 'title',
            reflective: true,
        },
        translate: {
            experimental: true,
        },
        // additional global attributes that are not present in the link above.
        role: {
            attribute: 'role',
        },
        slot: {
            attribute: 'slot',
            experimental: true,
            error: `Using property or attribute "slot" is an anti-pattern.`
        }
    };
}

// TODO: complete this list with Element properties
// https://developer.mozilla.org/en-US/docs/Web/API/Element

// TODO: complete this list with Node properties
// https://developer.mozilla.org/en-US/docs/Web/API/Node

export const GlobalHTMLPropDescriptors: PropertyDescriptorMap = create(null);
export const AttrNameToPropNameMap: Record<string, string> = create(null);
export const PropNameToAttrNameMap: Record<string, string> = create(null);

// Synthetic creation of all AOM property descriptors
forEach.call(getOwnPropertyNames(GlobalAOMProperties), (propName: string) => {
    const attrName = StringToLowerCase.call(StringReplace.call(propName, ARIA_REGEX, 'aria-'));

    function get(this: HTMLElement) {
        const vm = this[ViewModelReflection];
        if (!hasOwnProperty.call(vm.cmpProps, propName)) {
            return null;
        }
        return vm.cmpProps[propName];
    }

    function set(this: HTMLElement, newValue: any) {
        // TODO: fallback to the root's AOM default semantics
        const vm = this[ViewModelReflection];
        const value = vm.cmpProps[propName] = isNull(newValue) ? null : newValue + ''; // storing the normalized new value
        if (isNull(value)) {
            newValue = vm.rootProps[propName];
            vm.hostAttrs[attrName] = undefined;
        } else {
            vm.hostAttrs[attrName] = 1;
        }
        if (isNull(newValue)) {
            removeAttribute.call(this, attrName);
        } else {
            setAttribute.call(this, attrName, newValue);
        }
    }

    // TODO: eventually this descriptors should come from HTMLElement.prototype.*
    GlobalHTMLPropDescriptors[propName] = {
        set,
        get,
        configurable: true,
        enumerable: true,
    };
    AttrNameToPropNameMap[attrName] = propName;
    PropNameToAttrNameMap[propName] = attrName;
});

forEach.call(defaultDefHTMLPropertyNames, (propName) => {
    const descriptor = getOwnPropertyDescriptor(HTMLElement.prototype, propName);
    if (!isUndefined(descriptor)) {
        GlobalHTMLPropDescriptors[propName] = descriptor;
        const attrName = StringToLowerCase.call(propName);
        AttrNameToPropNameMap[attrName] = propName;
        PropNameToAttrNameMap[propName] = attrName;
    }
});

forEach.call(HTMLPropertyNamesWithLowercasedReflectiveAttributes, (propName) => {
    const attrName = StringToLowerCase.call(propName);
    AttrNameToPropNameMap[attrName] = propName;
    PropNameToAttrNameMap[propName] = attrName;
});

if (isUndefined(GlobalHTMLPropDescriptors.id)) {
    // In IE11, id property is on Element.prototype instead of HTMLElement
    GlobalHTMLPropDescriptors.id = getOwnPropertyDescriptor(Element.prototype, 'id') as PropertyDescriptor;
    AttrNameToPropNameMap.id = PropNameToAttrNameMap.id = 'id';
}

// https://dom.spec.whatwg.org/#dom-event-composed
// This is a very dummy, simple polyfill for composed
if (!getOwnPropertyDescriptor(Event.prototype, 'composed')) {
    defineProperties(Event.prototype, {
        composed: {
            value: true, // yes, assuming all native events are composed (it is a compromise)
            configurable: true,
            enumerable: true,
            writable: true,
        },
    });
    const { CustomEvent: OriginalCustomEvent } = (window as any);
    (window as any).CustomEvent = function PatchedCustomEvent(this: Event, type: string, eventInitDict: CustomEventInit<any>): Event {
        const event = new OriginalCustomEvent(type, eventInitDict);
        // support for composed on custom events
        (event as any).composed = !!(eventInitDict && (eventInitDict as any).composed);
        return event;
    };
    (window as any).CustomEvent.prototype = OriginalCustomEvent.prototype;
}

export const CustomEvent = (window as any).CustomEvent;
