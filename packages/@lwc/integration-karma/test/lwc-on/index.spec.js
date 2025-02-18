import { createElement } from 'lwc';
import Basic from 'x/basic';
import Ignored from 'x/ignored';
import CaseVariants from 'x/caseVariants';
// import Override from 'x/override';
import Spread from 'x/spread';
import Lifecycle from 'x/lifecycle';
// import Rerender from 'x/rerender';
// import Loop from 'x/loop';

describe('lwc:on', () => {
    let consoleSpy;

    beforeEach(() => {
        consoleSpy = spyOn(console, 'log');
    });

    it('adds multiple event listeners', () => {
        const element = createElement('x-basic', { is: Basic });
        document.body.appendChild(element);

        const button = element.shadowRoot.querySelector('button');
        button.click();
        button.dispatchEvent(new MouseEvent('mouseover'));

        expect(consoleSpy).toHaveBeenCalledWith('click handler called');
        expect(consoleSpy).toHaveBeenCalledWith('mouseover handler called');
    });

    it('event listeners added by lwc:on are bound to the owner component', () => {
        const element = createElement('x-basic', { is: Basic });
        document.body.appendChild(element);

        const button = element.shadowRoot.querySelector('button');
        button.click();

        expect(consoleSpy).toHaveBeenCalledWith("'this' is the component");
    });

    describe('ignored properties', () => {
        let element;
        let button;

        function setup(propType) {
            element = createElement('x-ignored', { is: Ignored });
            element[propType] = true;
            document.body.appendChild(element);
            button = element.shadowRoot.querySelector('button');
        }

        // In these tests, we are implicitly asserting that no error is thrown if the test passes

        it('silently ignores non-enumerable properties', () => {
            setup('nonEnumerableProp');
            button.click();
            expect(consoleSpy).not.toHaveBeenCalledWith('non-enumerable handler called');
        });

        it('silently ignores inherited properties', () => {
            setup('inheritedProp');
            button.click();
            expect(consoleSpy).not.toHaveBeenCalledWith('inherited handler called');
        });

        it('silently ignores symbol-keyed properties', () => {
            setup('symbolKeyProp');
        });
    });

    describe('event type case', () => {
        let element;
        let button;

        beforeEach(() => {
            element = createElement('x-case-variants', { is: CaseVariants });
            button = element.shadowRoot.querySelector('button');
            document.body.appendChild(element);
        });

        it('adds event listeners corresponding to lowercase keyed property', () => {
            button.dispatchEvent(new CustomEvent('lowercase'));
            expect(consoleSpy).toHaveBeenCalledWith('lowercase handler called');
        });

        it('adds event listeners corresponding to kebab-case keyed property', () => {
            button.dispatchEvent(new CustomEvent('kebab-case'));
            expect(consoleSpy).toHaveBeenCalledWith('kebab-case handler called');
        });

        it('adds event listeners corresponding to camelCase keyed property', () => {
            button.dispatchEvent(new CustomEvent('camelCase'));
            expect(consoleSpy).toHaveBeenCalledWith('camelCase handler called');
        });

        it('adds event listeners corresponding to CAPScase keyed property', () => {
            button.dispatchEvent(new CustomEvent('CAPSCASE'));
            expect(consoleSpy).toHaveBeenCalledWith('CAPSCASE handler called');
        });

        it('adds event listeners corresponding to PascalCase keyed property', () => {
            button.dispatchEvent(new CustomEvent('PascalCase'));
            expect(consoleSpy).toHaveBeenCalledWith('PascalCase handler called');
        });

        it('adds event listeners corresponding to empty-string keyed property', () => {
            button.dispatchEvent(new CustomEvent(''));
            expect(consoleSpy).toHaveBeenCalledWith('empty string handler called');
        });
    });

    // it("lwc:on's event listeners overrides event listener directly defined on template", () => {
    //     const consoleSpy = spyOn(console, 'log');
    //     const element = createElement('x-override', { is: Override });
    //     document.body.appendChild(element);

    //     const button = element.shadowRoot.querySelector('button');
    //     button.click();

    //     expect(consoleSpy).toHaveBeenCalledWith('lwc:on handler called');
    //     expect(consoleSpy).not.toHaveBeenCalledWith('template handler called');
    // });

    describe('event listeners with spread', () => {
        it('event listeners are added independently from lwc:on and lwc:spread', () => {
            const element = createElement('x-spread', { is: Spread });
            document.body.appendChild(element);

            const button = element.shadowRoot.querySelector('button');
            button.click();

            expect(consoleSpy).toHaveBeenCalledWith('lwc:spread handler called');
            expect(consoleSpy).toHaveBeenCalledWith('lwc:on handler called');
        });
    });

    it("event listeners are added before child's connectedCallback", () => {
        const element = createElement('x-lifecycle', { is: Lifecycle });

        document.body.appendChild(element);

        expect(consoleSpy).toHaveBeenCalledWith(
            'handled events dispatched from child connectedCallback'
        );
    });

    // describe('re-render behavior', () => {
    //     it('Event listeners on simple lwc component do not update when re-rendering with changed lwc:on arguments', () => {
    //         const consoleSpy = spyOn(console, 'log');
    //         const element = createElement('x-rerender', { is: Rerender });
    //         document.body.appendChild(element);

    //         const child = element.shadowRoot.querySelector('[data-id="static"]');
    //         child.click();
    //         expect(consoleSpy).toHaveBeenCalledWith('original handler called');

    //         // Update handlers and verify it doesn't change
    //         element.updateHandlers();
    //         element.triggerReRender();

    //         consoleSpy.calls.reset();
    //         child.click();
    //         expect(consoleSpy).toHaveBeenCalledWith('original handler called');
    //         expect(consoleSpy).not.toHaveBeenCalledWith('new handler called');
    //     });

    //     it('Event listeners on lwc:component do not update when re-rendering with changed lwc:on arguments but unchanged lwc:is arguments', () => {
    //         const consoleSpy = spyOn(console, 'log');
    //         const element = createElement('x-rerender', { is: Rerender });
    //         document.body.appendChild(element);

    //         const child = element.shadowRoot.querySelector('[data-id="dynamic"]');
    //         child.click();
    //         expect(consoleSpy).toHaveBeenCalledWith('original handler called');

    //         // Update handlers but keep same component
    //         element.updateHandlers();
    //         element.triggerReRender();

    //         consoleSpy.calls.reset();
    //         child.click();
    //         expect(consoleSpy).toHaveBeenCalledWith('original handler called');
    //         expect(consoleSpy).not.toHaveBeenCalledWith('new handler called');
    //     });

    //     it('Event listeners on lwc:component do update when re-rendering with both lwc:on and lwc:is arguments changed', () => {
    //         const consoleSpy = spyOn(console, 'log');
    //         const element = createElement('x-rerender', { is: Rerender });
    //         document.body.appendChild(element);

    //         const child = element.shadowRoot.querySelector('[data-id="dynamic"]');
    //         child.click();
    //         expect(consoleSpy).toHaveBeenCalledWith('original handler called');

    //         // Update both handlers and component
    //         element.updateHandlers();
    //         element.updateDynamicComponent();
    //         element.triggerReRender();

    //         consoleSpy.calls.reset();
    //         const newChild = element.shadowRoot.querySelector('[data-id="dynamic"]');
    //         newChild.click();
    //         expect(consoleSpy).toHaveBeenCalledWith('new handler called');
    //         expect(consoleSpy).not.toHaveBeenCalledWith('original handler called');
    //     });
    // });

    // describe('for:each loop handling', () => {
    //     describe('with non-local handlers', () => {
    //         it('event listeners are not updated on rerender', () => {
    //             const consoleSpy = spyOn(console, 'log');
    //             const element = createElement('x-loop', { is: Loop });
    //             document.body.appendChild(element);

    //             const button = element.shadowRoot.querySelector('.non-local[data-id="1"]');
    //             button.click();
    //             expect(consoleSpy).toHaveBeenCalledWith('original handler called');

    //             // Update handlers and verify it doesn't change
    //             element.updateHandlers();
    //             element.triggerReRender();

    //             consoleSpy.calls.reset();
    //             button.click();
    //             expect(consoleSpy).toHaveBeenCalledWith('original handler called');
    //             expect(consoleSpy).not.toHaveBeenCalledWith('new handler called');
    //         });
    //     });

    //     describe('with local handlers', () => {
    //         it('event listeners use current item handler', () => {
    //             const consoleSpy = spyOn(console, 'log');
    //             const element = createElement('x-loop', { is: Loop });
    //             document.body.appendChild(element);

    //             const button = element.shadowRoot.querySelector('.local[data-id="1"]');
    //             button.click();
    //             expect(consoleSpy).toHaveBeenCalledWith('item handler called');
    //         });
    //     });
    // });
});
