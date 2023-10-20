import { createElement } from 'lwc';
import Component from 'x/component';

// Originally taken from @lwc/engine-core. This is used in testing to avoid regressing these HTML properties. Via:
// https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement
const globalHtmlProperties = {
    accessKey: {
        attribute: 'accesskey',
    },
    accessKeyLabel: {},
    className: {
        attribute: 'class',
    },
    contentEditable: {
        attribute: 'contenteditable',
    },
    dataset: {},
    dir: {
        attribute: 'dir',
    },
    draggable: {
        attribute: 'draggable',
    },
    dropzone: {
        attribute: 'dropzone',
    },
    hidden: {
        attribute: 'hidden',
    },
    id: {
        attribute: 'id',
    },
    inputMode: {
        attribute: 'inputmode',
    },
    lang: {
        attribute: 'lang',
    },
    slot: {
        attribute: 'slot',
    },
    spellcheck: {
        attribute: 'spellcheck',
    },
    style: {
        attribute: 'style',
    },
    tabIndex: {
        attribute: 'tabindex',
    },
    title: {
        attribute: 'title',
    },
    translate: {
        attribute: 'translate',
    },

    // additional "global attributes" that are not present in the link above.
    isContentEditable: {},
    offsetHeight: {},
    offsetLeft: {},
    offsetParent: {},
    offsetTop: {},
    offsetWidth: {},
    role: {
        attribute: 'role',
    },
};

// These are a subset of the above list that come from defaultDefHTMLPropertyNames in attributes.ts
// and AriaPropNameToAttrNameMap in aria.ts in @lwc/engine-core. These should also be kept in sync.
const htmlElementOriginalDescriptors = [
    'accessKey',
    'dir',
    'draggable',
    'hidden',
    'id',
    'lang',
    'role',
    'spellcheck',
    'tabIndex',
    'title',
];

describe('global html properties', () => {
    let elm;

    beforeEach(() => {
        elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);
    });

    for (const propName of Object.keys(globalHtmlProperties)) {
        const { attribute } = globalHtmlProperties[propName];

        const isOriginalDescriptor = htmlElementOriginalDescriptors.includes(propName);

        const getPropertyValue = () => {
            return elm.getProperty(propName);
        };

        const setPropertyValue = (value) => {
            elm.setProperty(propName, value);
        };

        // Return a reasonable property value given what type the property accepts (boolean, number, keyword, etc.)
        const getValueToSet = () => {
            switch (propName) {
                case 'contentEditable':
                case 'draggable':
                case 'hidden':
                case 'spellcheck':
                    return true;
                case 'tabIndex':
                    return 1;
                case 'dir':
                    return 'rtl';
                case 'dropzone':
                    return 'copy';
                case 'inputMode':
                    return 'numeric';
                case 'lang':
                    return 'en';
                case 'style':
                    return 'display: block;';
                case 'translate':
                    return 'yes';
                default:
                    return 'foo';
            }
        };

        // Return the expected property value when no setter has been called
        const getDefaultPropertyValue = () => {
            switch (propName) {
                case 'spellcheck':
                case 'tabIndex':
                    // For spellcheck, Firefox returns false, Chrome/Safari returns true
                    // For tabIndex, IE11 returns 0 and the others return -1
                    return document.createElement('div')[propName];
                case 'draggable':
                case 'hidden':
                    return false;
                case 'accessKey':
                    return '';
                case 'dir':
                case 'id':
                case 'lang':
                    return '';
                case 'role':
                    // For role, Firefox returns empty string when supported. Chrome/Safari return null
                    // https://bugzilla.mozilla.org/show_bug.cgi?id=1853209
                    return 'role' in HTMLElement.prototype
                        ? document.createElement('div').role
                        : null;
                case 'title':
                    return '';
                default:
                    return undefined;
            }
        };

        describe(propName, () => {
            it('getter', () => {
                const value = getPropertyValue();
                expect(value).toEqual(getDefaultPropertyValue());
            });

            it('setter', () => {
                const valueToSet = getValueToSet();
                setPropertyValue(valueToSet);

                const retrievedPropValue = getPropertyValue();
                expect(retrievedPropValue).toEqual(valueToSet);
            });

            if (attribute) {
                it('attribute reflection', () => {
                    const initialNumAttributes = elm.attributes.length;
                    expect(elm.getAttribute(attribute)).toBeNull(); // initial attribute value

                    const valueToSet = getValueToSet();
                    setPropertyValue(valueToSet);

                    // In the case of non-original descriptors, the attribute is not set
                    let expectedAttributeValue = isOriginalDescriptor
                        ? valueToSet.toString()
                        : null;
                    if (propName === 'hidden') {
                        // `hidden` is a special case; it's reflected to the empty string
                        expectedAttributeValue = '';
                    }
                    expect(elm.getAttribute(attribute)).toEqual(expectedAttributeValue);

                    // In the case of non-original descriptors, the attribute is not set
                    const expectedNumAddedAttributes = isOriginalDescriptor ? 1 : 0;
                    expect(elm.attributes.length).toEqual(
                        initialNumAttributes + expectedNumAddedAttributes
                    );
                });
            } else {
                it('no attribute reflection', () => {
                    const initialNumAttributes = elm.attributes.length;
                    setPropertyValue(getValueToSet());
                    expect(elm.attributes.length).toEqual(initialNumAttributes); // no attributes added
                });
            }
        });
    }
});
