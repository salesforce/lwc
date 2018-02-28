import {
    StringToLowerCase,
    StringReplace,
} from './language';

const {
    getAttribute,
    getAttributeNS,
    setAttribute,
    setAttributeNS,
    removeAttribute,
    removeAttributeNS,
    querySelector,
    querySelectorAll,
} = Element.prototype;

export {
    getAttribute,
    getAttributeNS,
    setAttribute,
    setAttributeNS,
    removeAttribute,
    removeAttributeNS,
    querySelector,
    querySelectorAll,
};

// These properties get added to LWCElement.prototype publicProps automatically
export const defaultDefHTMLPropertyNames = ['dir', 'id', 'accessKey', 'title', 'lang', 'hidden', 'draggable'];

// Few more execptions that are using the attribute name to match the property in lowercase.
// this list was compiled from https://msdn.microsoft.com/en-us/library/ms533062(v=vs.85).aspx
// and https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
// Note: this list most be in sync with the compiler as well.
export const HTMLPropertyNamesWithLowercasedReflectiveAttributes = [
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


export function getAriaAttributeName(propName: string) {
    return StringToLowerCase.call(StringReplace.apply(propName, [ARIA_REGEX, 'aria-']));
}

// TODO: clean up these props (casing, etc.)
// TODO: move this to another file
// Global Aria and Role Properties derived from ARIA and Role Attributes with their
// respective default value.
// https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques
export const GlobalARIAProperties: Record<string, any> = {
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
export const GlobalHTMLProperties = {
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

// TODO: complete this list with Element properties
// https://developer.mozilla.org/en-US/docs/Web/API/Element

// TODO: complete this list with Node properties
// https://developer.mozilla.org/en-US/docs/Web/API/Node
