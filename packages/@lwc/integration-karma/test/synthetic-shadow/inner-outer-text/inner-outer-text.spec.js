import { createElement, setFeatureFlagForTest } from 'lwc';
import Container from 'x/container';

if (!process.env.NATIVE_SHADOW) {
    beforeAll(() => {
        setFeatureFlagForTest('ENABLE_INNER_OUTER_TEXT_PATCH', true);
    });

    afterAll(() => {
        setFeatureFlagForTest('ENABLE_INNER_OUTER_TEXT_PATCH', false);
    });

    describe('innerText', () => {
        let elm;
        beforeEach(() => {
            elm = createElement('x-container', { is: Container });
            document.body.appendChild(elm);
        });

        it('should return textContent when text within element is not selectable', () => {
            const testCase = elm.shadowRoot.querySelector('.non-selectable-text');

            expect(testCase.innerText).toBe('non selectable text');
        });

        it('should remove consecutive LF in between from partial results', () => {
            const testCase = elm.shadowRoot.querySelector('.consecutive-LF');

            expect(testCase.innerText).toBe(`initial

first case text

second case text

end`);
        });

        it('should remove hidden text + removes empty text between LF counts', () => {
            const testCase = elm.shadowRoot.querySelector('.hidden-text-in-between');

            expect(testCase.innerText).toBe(`initialend`);
        });

        it('should remove hidden text with css', () => {
            const testCase = elm.shadowRoot.querySelector('.hidden-text-with-css');

            expect(testCase.innerText).toBe(`initialend`);
        });

        it('should display textContent if element is hidden', () => {
            const testCase = elm.shadowRoot.querySelector('.element-hidden-shows-text-content');

            expect(testCase.innerText).toBe(`initialfirst case textsecond case textend`);
        });

        it('should return empty when childNodes are hidden', () => {
            const testCase = elm.shadowRoot.querySelector('.empty-inner-text-due-hidden-children');

            expect(testCase.innerText).toBe(``);
        });

        it('should collect text from multiple levels', () => {
            const testCase = elm.shadowRoot.querySelector('.collect-text-multiple-levels');

            expect(testCase.innerText)
                .toBe(`This is, a text that should be displayed, in one line. It includes links.

Also paragraphs

and then another text`);
        });

        it('should collect text from tables (table-cell and table-row)', () => {
            const testCase = elm.shadowRoot.querySelector('.table-testcase');

            // Notice that:
            // 1. the last \t on each row is incorrect, it's a relaxation from the spec.
            // 2. the last \n is incorrect, it's also a relaxation from the spec.
            expect(testCase.innerText).toBe(`1,1\t1,2\t
2,1\t2,2\t
`);
        });

        it('should collect text from select', () => {
            const testCase = elm.shadowRoot.querySelector('.select-testcase');

            expect(testCase.innerText).toBe(`Chose a pet:
Dog
Cat`);
        });

        it('should not collect text from hidden select', () => {
            const testCase = elm.shadowRoot.querySelector('.select-hidden-testcase');

            expect(testCase.innerText).toBe(`Chose a pet:`);
        });

        it('should not collect text from textarea', () => {
            const testCase = elm.shadowRoot.querySelector('.textarea-testcase');

            expect(testCase.innerText).toBe(`Tell us your story:`);
        });

        it('should not collect text from datalist', () => {
            const testCase = elm.shadowRoot.querySelector('.datalist-case');

            expect(testCase.innerText).toBe(`Choose a flavor:`);
        });

        it('should not go inside custom element shadow', () => {
            const testElement = elm.shadowRoot.querySelector('.without-slotted-content');

            expect(testElement.innerText).toBe('first text\nsecond text');
        });

        it('should process custom elements light dom', () => {
            const testElement = elm.shadowRoot.querySelector('.with-slotted-content');

            expect(testElement.innerText).toBe('first text\n\nslotted element\n\nsecond text');
        });

        it('should process custom elements light dom across multiple shadows', () => {
            const testElement = elm.shadowRoot.querySelector('.with-slotted-content-2-levels');

            expect(testElement.innerText).toBe('first text\n\nslotted element\n\nsecond text');
        });

        describe('slot element', () => {
            it('should return default slot content when no content is passed into the slot', () => {
                const testElement = elm.shadowRoot
                    .querySelector('.without-slotted-content x-slotable')
                    .shadowRoot.querySelector('slot');

                expect(testElement.innerText).toBe('default slot content');
            });

            it('should be empty when default slot content is overwritten', () => {
                const testElement = elm.shadowRoot
                    .querySelector('.with-slotted-content x-slotable')
                    .shadowRoot.querySelector('slot');

                expect(testElement.innerText).toBe('');
            });
        });
    });

    const outerTextDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'outerText');

    // Firefox does not have outerText.
    if (outerTextDescriptor) {
        describe('outerText', () => {
            let elm;
            beforeEach(() => {
                elm = createElement('x-container', { is: Container });
                document.body.appendChild(elm);
            });

            it('should not go inside custom element shadow', () => {
                const testElement = elm.shadowRoot.querySelector('.without-slotted-content');

                expect(testElement.outerText).toBe('first text\nsecond text');
            });

            it('should process custom elements light dom', () => {
                const testElement = elm.shadowRoot.querySelector('.with-slotted-content');

                expect(testElement.outerText).toBe('first text\n\nslotted element\n\nsecond text');
            });

            it('should process custom elements light dom across multiple shadows', () => {
                const testElement = elm.shadowRoot.querySelector('.with-slotted-content-2-levels');

                expect(testElement.outerText).toBe('first text\n\nslotted element\n\nsecond text');
            });
        });
    }
}
