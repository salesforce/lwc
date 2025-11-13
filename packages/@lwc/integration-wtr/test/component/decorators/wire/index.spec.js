import { createElement, LightningElement, wire } from 'lwc';

import { adapter } from 'x/adapter';
import duplicatePropertyTemplate from 'x/duplicatePropertyTemplate';

describe('restrictions', () => {
    it('logs a property error when a wired field conflicts with a method', () => {
        expect(() => {
            // The following class is wrapped by the compiler with registerDecorators. We check here
            // if the fields are validated properly.
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            class Invalid extends LightningElement {
                @wire(adapter) showFeatures;
                // eslint-disable-next-line no-dupe-class-members
                showFeatures() {}
            }
        }).toLogErrorDev(
            /Invalid @wire showFeatures field\. Found a duplicate method with the same name\./
        );
    });
});

describe('regression [W-9927596] - wired field with duplicate observed field', () => {
    it('log errors when evaluated and preserve the wired property', () => {
        let Ctor;

        expect(() => {
            class DuplicateProperty extends LightningElement {
                foo = 'observed';
                // eslint-disable-next-line no-dupe-class-members
                @wire(adapter) foo = 'wired';

                render() {
                    return duplicatePropertyTemplate;
                }
            }

            Ctor = DuplicateProperty;
        }).toLogErrorDev(
            /Invalid observed foo field\. Found a duplicate accessor with the same name\./
        );

        const elm = createElement('x-duplicate-property', { is: Ctor });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('p').textContent).toBe('wired');
    });
});
