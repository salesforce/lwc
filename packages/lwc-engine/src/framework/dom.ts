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

// Global ARIA Attributes
// https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques
export const GlobalARIAProperties = {
    'aria-autocomplete': true,
    'aria-checked': true,
    'aria-current': true,
    'aria-disabled': true,
    'aria-expanded': true,
    'aria-haspopup': true,
    'aria-hidden': true,
    'aria-invalid': true,
    'aria-label': true,
    'aria-level': true,
    'aria-multiline': true,
    'aria-multiselectable': true,
    'aria-orientation': true,
    'aria-pressed': true,
    'aria-readonly': true,
    'aria-required': true,
    'aria-selected': true,
    'aria-sort': true,
    'aria-valuemax': true,
    'aria-valuemin': true,
    'aria-valuenow': true,
    'aria-valuetext': true,
    'aria-live': true,
    'aria-relevant': true,
    'aria-atomic': true,
    'aria-busy': true,
    'aria-dropeffect': true,
    'aria-dragged': true,
    'aria-activedescendant': true,
    'aria-controls': true,
    'aria-describedby': true,
    'aria-flowto': true,
    'aria-labelledby': true,
    'aria-owns': true,
    'aria-posinset': true,
    'aria-setsize': true,
};

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
        msg: 'Using property "dataset" is an anti-pattern. Instead declare `static observedAttributes = ["data-foo"]` and use `attributeChangedCallback(attrName, oldValue, newValue)` to get a notification each time the attribute changes.',
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
        experimental: true,
    },
    offsetLeft: {
        readOnly: true,
        experimental: true,
    },
    offsetParent: {
        readOnly: true,
        experimental: true,
    },
    offsetTop: {
        readOnly: true,
        experimental: true,
    },
    offsetWidth: {
        readOnly: true,
        experimental: true,
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
