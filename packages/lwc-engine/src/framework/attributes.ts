import {
    StringToLowerCase,
    StringReplace,
    create,
    forEach,
    isUndefined,
    getPropertyDescriptor,
} from './language';
import { createCustomElementAOMPropertyDescriptor } from './dom/aom';

// These properties get added to LWCElement.prototype publicProps automatically
const defaultDefHTMLPropertyNames = ['dir', 'id', 'accessKey', 'title', 'lang', 'hidden', 'draggable', 'tabIndex'];

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

// Global Aria and Role Properties derived from ARIA and Role Attributes.
// https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques
export const ElementAOMPropertyNames = [
    'ariaAutoComplete',
    'ariaChecked',
    'ariaCurrent',
    'ariaDisabled',
    'ariaExpanded',
    'ariaHasPopUp',
    'ariaHidden',
    'ariaInvalid',
    'ariaLabel',
    'ariaLevel',
    'ariaMultiLine',
    'ariaMultiSelectable',
    'ariaOrientation',
    'ariaPressed',
    'ariaReadOnly',
    'ariaRequired',
    'ariaSelected',
    'ariaSort',
    'ariaValueMax',
    'ariaValueMin',
    'ariaValueNow',
    'ariaValueText',
    'ariaLive',
    'ariaRelevant',
    'ariaAtomic',
    'ariaBusy',
    'ariaActiveDescendant',
    'ariaControls',
    'ariaDescribedBy',
    'ariaFlowTo',
    'ariaLabelledBy',
    'ariaOwns',
    'ariaPosInSet',
    'ariaSetSize',
    'ariaColCount',
    'ariaColIndex',
    'ariaDetails',
    'ariaErrorMessage',
    'ariaKeyShortcuts',
    'ariaModal',
    'ariaPlaceholder',
    'ariaRoleDescription',
    'ariaRowCount',
    'ariaRowIndex',
    'ariaRowSpan',
    'role',
];

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

export const CustomElementGlobalPropertyDescriptors: PropertyDescriptorMap = create(null);
const AttrNameToPropNameMap: Record<string, string> = create(null);
const PropNameToAttrNameMap: Record<string, string> = create(null);

// Synthetic creation of all AOM property descriptors for Custom Elements
forEach.call(ElementAOMPropertyNames, (propName: string) => {
    const attrName = StringToLowerCase.call(StringReplace.call(propName, ARIA_REGEX, 'aria-'));
    AttrNameToPropNameMap[attrName] = propName;
    PropNameToAttrNameMap[propName] = attrName;
    CustomElementGlobalPropertyDescriptors[propName] = createCustomElementAOMPropertyDescriptor(propName, attrName, null);
});

forEach.call(defaultDefHTMLPropertyNames, (propName) => {
    // Note: intentionally using our in-house getPropertyDescriptor instead of getOwnPropertyDescriptor here because
    // in IE11, id property is on Element.prototype instead of HTMLElement, and we suspect that more will fall into
    // this category, so, better to be sure.
    const descriptor = getPropertyDescriptor(HTMLElement.prototype, propName);
    if (!isUndefined(descriptor)) {
        CustomElementGlobalPropertyDescriptors[propName] = descriptor;
    }
    const attrName = StringToLowerCase.call(propName);
    AttrNameToPropNameMap[attrName] = propName;
    PropNameToAttrNameMap[propName] = attrName;
});

forEach.call(HTMLPropertyNamesWithLowercasedReflectiveAttributes, (propName) => {
    const attrName = StringToLowerCase.call(propName);
    AttrNameToPropNameMap[attrName] = propName;
    PropNameToAttrNameMap[propName] = attrName;
});

const CAMEL_REGEX = /-([a-z])/g;

/**
 * This method maps between attribute names
 * and the corresponding property name.
 */
export function getPropNameFromAttrName(attrName: string): string {
    if (isUndefined(AttrNameToPropNameMap[attrName])) {
        AttrNameToPropNameMap[attrName] = StringReplace.call(attrName, CAMEL_REGEX, (g: string): string => g[1].toUpperCase());
    }
    return AttrNameToPropNameMap[attrName];
}

const CAPS_REGEX = /[A-Z]/g;

/**
 * This method maps between property names
 * and the corresponding attribute name.
 */
export function getAttrNameFromPropName(propName: string): string {
    if (isUndefined(PropNameToAttrNameMap[propName])) {
        PropNameToAttrNameMap[propName] = StringReplace.call(propName, CAPS_REGEX, (match: string): string => '-' + match.toLowerCase());
    }
    return PropNameToAttrNameMap[propName];
}
