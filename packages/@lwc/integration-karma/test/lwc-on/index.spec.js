import { createElement } from 'lwc';
import Basic from 'x/basic';
import Ignored from 'x/ignored';
import CaseVariants from 'x/caseVariants';
import Spread from 'x/spread';
import Lifecycle from 'x/lifecycle';
import Rerender from 'x/rerender';

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
        const EVENT_HANDLER_OBJECTS = {
            nonEnumerableProp: Object.create(null, {
                click: {
                    value: function () {
                        // eslint-disable-next-line no-console
                        console.log('non-enumerable handler called');
                    },
                    enumerable: false,
                },
            }),
            inheritedProp: {
                __proto__: {
                    click: function () {
                        // eslint-disable-next-line no-console
                        console.log('inherited handler called');
                    },
                },
            },
            symbolKeyProp: {
                [Symbol('test')]: function () {
                    // eslint-disable-next-line no-console
                    console.log('symbol-keyed handler called');
                },
            },
        };

        function setup(propType) {
            element = createElement('x-ignored', { is: Ignored });
            element.eventHandlers = EVENT_HANDLER_OBJECTS[propType];
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
            document.body.appendChild(element);
            button = element.shadowRoot.querySelector('button');
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

    describe('re-render behavior', () => {
        let element;
        let button;

        beforeEach(() => {
            element = createElement('x-rerender', { is: Rerender });
            document.body.appendChild(element);
            button = element.shadowRoot.querySelector('button');
        });

        it('Event listeners are added when lwc:on is provided a new object with additional properties', async () => {
            element.listenersName = 'click and mouseover';
            await element.triggerReRender();

            button.click();
            button.dispatchEvent(new MouseEvent('mouseover'));
            expect(consoleSpy).toHaveBeenCalledWith('click handler called');
            expect(consoleSpy).toHaveBeenCalledWith('mouseover handler called');
        });

        it('Event listeners are removed when lwc:on is provided a new object with reduced properties', async () => {
            element.listenersName = 'empty';
            await element.triggerReRender();

            button.click();
            expect(consoleSpy).not.toHaveBeenCalledWith('click handler called');
        });

        it('Event listeners are modified when lwc:on is provided a new object with modified properties', async () => {
            element.listenersName = 'modified click';
            await element.triggerReRender();

            button.click();
            expect(consoleSpy).not.toHaveBeenCalledWith('click handler called');
            expect(consoleSpy).toHaveBeenCalledWith('modified click handler called');
        });
    });
});
