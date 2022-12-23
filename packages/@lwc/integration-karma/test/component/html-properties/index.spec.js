import { createElement } from 'lwc';
import Component from 'x/component';

function offsetPropertyErrorMessage(name) {
    return `Using the \`${name}\` property is an anti-pattern because it rounds the value to an integer. Instead, use the \`getBoundingClientRect\` method to obtain fractional values for the size of an element and its position relative to the viewport.`;
}

// See attributes.ts in @lwc/engine-core for the list this is taken from. It should be kept up-to-date with that list
const globalHtmlProperties = {
    accessKey: {
        attribute: 'accesskey',
    },
    accessKeyLabel: {
        readOnly: true,
    },
    className: {
        attribute: 'class',
        error: 'Using the `className` property is an anti-pattern because of slow runtime behavior and potential conflicts with classes provided by the owner element. Use the `classList` API instead.',
    },
    contentEditable: {
        attribute: 'contenteditable',
    },
    dataset: {
        readOnly: true,
        error: "Using the `dataset` property is an anti-pattern because it can't be statically analyzed. Expose each property individually using the `@api` decorator instead.",
    },
    dir: {
        attribute: 'dir',
    },
    draggable: {
        attribute: 'draggable',
    },
    dropzone: {
        attribute: 'dropzone',
        readOnly: true,
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
        error: 'Using the `slot` property is an anti-pattern.',
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
    isContentEditable: {
        readOnly: true,
    },
    offsetHeight: {
        readOnly: true,
        error: offsetPropertyErrorMessage('offsetHeight'),
    },
    offsetLeft: {
        readOnly: true,
        error: offsetPropertyErrorMessage('offsetLeft'),
    },
    offsetParent: {
        readOnly: true,
    },
    offsetTop: {
        readOnly: true,
        error: offsetPropertyErrorMessage('offsetTop'),
    },
    offsetWidth: {
        readOnly: true,
        error: offsetPropertyErrorMessage('offsetWidth'),
    },
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
        const { attribute, error, readOnly } = globalHtmlProperties[propName];

        const isOriginalDescriptor = htmlElementOriginalDescriptors.includes(propName);

        const getExpectedErrorMessage = () => {
            const message = [];
            message.push(`Accessing the global HTML property "${propName}" is disabled.`);
            if (error) {
                message.push(error);
            } else if (attribute) {
                message.push(`Instead access it via \`this.getAttribute("${attribute}")\`.`);
            }
            return message.join('\n') + '\n';
        };

        const getPropertyValue = () => {
            let value;
            // eslint-disable-next-line jest/valid-expect
            let expected = expect(() => {
                value = elm.getProperty(propName);
            });
            if (isOriginalDescriptor) {
                expected = expected.not; // original descriptors do not log
            }
            expected.toLogErrorDev(`Error: [LWC error]: ${getExpectedErrorMessage()}`);
            return value;
        };

        const setPropertyValue = (value) => {
            // eslint-disable-next-line jest/valid-expect
            let expected = expect(() => {
                elm.setProperty(propName, value);
            });
            if (!readOnly) {
                expected = expected.not; // only read-only logs an error here
            }
            expected.toLogErrorDev(
                `Error: [LWC error]: The global HTML property \`${propName}\` is read-only.\n`
            );
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
                    return null;
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
                // In the case of non-original descriptors, the property value is not set, in dev mode
                const expectedPropValue =
                    isOriginalDescriptor || process.env.NODE_ENV === 'production'
                        ? valueToSet
                        : undefined;
                expect(retrievedPropValue).toEqual(expectedPropValue);
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
