import { createElement } from 'lwc';
import Component from 'x/component';

describe('restrictions', () => {
    let elm;
    beforeEach(() => {
        elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);
    });

    describe('ShadowRoot', () => {
        it('innerHTML', () => {
            expect(() => {
                elm.setInnerHtmlOnShadowRoot();
            }).toThrowErrorDev(TypeError, 'Invalid attempt to set innerHTML on ShadowRoot.');
        });
        it('textContent', () => {
            expect(() => {
                elm.setTextContentOnShadowRoot();
            }).toThrowErrorDev(TypeError, 'Invalid attempt to set textContent on ShadowRoot.');
        });
    });

    describe('custom element', () => {
        it('innerHTML', () => {
            expect(() => {
                elm.innerHTML = '<div></div>';
            }).toThrowErrorDev(TypeError, 'Invalid attempt to set innerHTML on HTMLElement.');
        });
        it('outerHTML', () => {
            expect(() => {
                elm.outerHTML = '<div></div>';
            }).toThrowErrorDev(TypeError, 'Invalid attempt to set outerHTML on HTMLElement.');
        });
        it('textContent', () => {
            expect(() => {
                elm.textContent = '<div></div>';
            }).toThrowErrorDev(TypeError, 'Invalid attempt to set textContent on HTMLElement.');
        });
        it('addEventListener', () => {
            expect(() => {
                elm.addEventListener('click', () => {}, { once: true });
            }).toLogErrorDev(
                'Error: [LWC error]: The `addEventListener` method in `LightningElement` does not support any options.\n'
            );
        });
    });

    describe('LightningElement', () => {
        it('dispatchEvent', () => {
            expect(() => {
                elm.dispatchEventWithInvalidName();
            }).toLogErrorDev(
                'Error: [LWC error]: Invalid event type "UPPERCASE-AND-HYPHENS" dispatched in element <x-component>. Event name must start with a lowercase letter and followed only lowercase letters, numbers, and underscores\n'
            );
        });

        it('get className', () => {
            expect(() => {
                elm.getClassName();
            }).toLogErrorDev(
                'Error: [LWC error]: Accessing the global HTML property "className" is disabled.\n' +
                    'Using the `className` property is an anti-pattern because of slow runtime behavior and potential conflicts with classes provided by the owner element. Use the `classList` API instead.\n'
            );
        });

        it('set accessKeyLabel', () => {
            expect(() => {
                elm.setAccessKeyLabel('foo');
            }).toLogErrorDev(
                'Error: [LWC error]: The global HTML property `accessKeyLabel` is read-only.\n'
            );
        });
    });

    describe('Element', () => {
        it('should throw on setting outerHTML', () => {
            // eslint-disable-next-line jest/valid-expect
            let expected = expect(() => {
                elm.shadowRoot.querySelector('div').outerHTML = '';
            });

            if (process.env.NODE_ENV === 'production' && !/Firefox/.test(navigator.userAgent)) {
                // in prod mode and only in firefox, this doesn't throw
                expected = expected.not;
            }

            expected.toThrowError(/Invalid attempt to set outerHTML on Element\./);
        });
    });
});
