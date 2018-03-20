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
    defineProperties,
} from './language';
import { ViewModelReflection } from "./utils";
import { VM } from './vm';

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

// TODO: once we start using the real shadowDOM, we can rely on:
// const { getRootNode } = Node.prototype;
// for now, we need to provide a dummy implementation to provide retargeting
function getRootNode(this: Node, options: Record<string, any> | undefined): Node {
    const composed: boolean = isUndefined(options) ? false : !!options.composed;
    let node: Node = this;
    while (node !== document) {
        if (!composed && !isUndefined(node[ViewModelReflection])) {
            return node; // this is not quite the root (it is the host), but for us is sufficient
        }
        const parent = node.parentNode;
        if (isNull(parent)) {
            return node;
        }
        node = parent;
    }
    return node;
}

export {
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
    ariaAutocomplete: null,
    ariaChecked: null,
    ariaCurrent: null,
    ariaDisabled: null,
    ariaExpanded: null,
    ariaHasPopUp: null,
    ariaHidden: null,
    ariaInvalid: null,
    ariaLabel: null,
    ariaLevel: null,
    ariaMultiline: null,
    ariaMultiSelectable: null,
    ariaOrientation: null,
    ariaPressed: null,
    ariaReadonly: null,
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
    ariaDropEffect: null,
    ariaDragged: null,
    ariaActiveDescendant: null,
    ariaControls: null,
    ariaDescribedBy: null,
    ariaFlowTo: null,
    ariaLabelledBy: null,
    ariaOwns: null,
    ariaPosInSet: null,
    ariaSetSize: null,
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
            newValue = vm.component.root[propName];
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
