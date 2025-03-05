import { createElement } from 'lwc';
import Basic from 'x/basic';
import ExecutionContext from 'x/executionContext';
import Ignored from 'x/ignored';
import CaseVariants from 'x/caseVariants';
import Spread from 'x/spread';
import Lifecycle from 'x/lifecycle';
import Rerender from 'x/rerender';
import RerenderLoop from 'x/rerenderLoop';
import PublicProp from 'x/publicProp';

import { catchUnhandledRejectionsAndErrors } from 'test-utils';

describe('lwc:on', () => {
    it('adds multiple event listeners', () => {
        const element = createElement('x-basic', { is: Basic });
        const testFn = jasmine.createSpy('test function');
        element.testFn = testFn;
        document.body.appendChild(element);
        const button = element.shadowRoot.querySelector('button');
        button.click();
        button.dispatchEvent(new MouseEvent('mouseover'));

        expect(testFn).toHaveBeenCalledWith('click handler called');
        expect(testFn).toHaveBeenCalledWith('mouseover handler called');
    });

    it('event listeners added by lwc:on are bound to the owner component', () => {
        const element = createElement('x-execution-context', { is: ExecutionContext });
        const testFn = jasmine.createSpy('test function');
        element.testFn = testFn;
        document.body.appendChild(element);
        const button = element.shadowRoot.querySelector('button');

        button.click();

        expect(testFn).toHaveBeenCalledWith("'this' is the component");
    });

    describe('ignored properties', () => {
        let element;
        let button;
        let testFn;

        function setup(propType) {
            element = createElement('x-ignored', { is: Ignored });
            testFn = jasmine.createSpy('test function');
            element.testFn = testFn;
            element.propType = propType;
            document.body.appendChild(element);
            button = element.shadowRoot.querySelector('button');
        }

        // In these tests, we are implicitly asserting that no error is thrown if the test passes

        it('silently ignores non-enumerable properties', () => {
            setup('non-enumerable');
            button.click();
            expect(testFn).not.toHaveBeenCalled();
        });

        it('silently ignores inherited properties', () => {
            setup('inherited');
            button.click();
            expect(testFn).not.toHaveBeenCalled();
        });

        it('silently ignores symbol-keyed properties', () => {
            setup('symbol-keyed');
        });
    });

    describe('event type case', () => {
        let element;
        let button;
        let testFn;

        function setup(propCase) {
            element = createElement('x-case-variants', { is: CaseVariants });
            testFn = jasmine.createSpy('test function');
            element.testFn = testFn;
            element.propCase = propCase;
            document.body.appendChild(element);
            button = element.shadowRoot.querySelector('button');
        }

        it('adds event listeners corresponding to lowercase keyed property', () => {
            setup('lower');
            button.dispatchEvent(new CustomEvent('lowercase'));
            expect(testFn).toHaveBeenCalledWith('lowercase handler called');
        });

        it('adds event listeners corresponding to kebab-case keyed property', () => {
            setup('kebab');
            button.dispatchEvent(new CustomEvent('kebab-case'));
            expect(testFn).toHaveBeenCalledWith('kebab-case handler called');
        });

        it('adds event listeners corresponding to camelCase keyed property', () => {
            setup('camel');
            button.dispatchEvent(new CustomEvent('camelCase'));
            expect(testFn).toHaveBeenCalledWith('camelCase handler called');
        });

        it('adds event listeners corresponding to CAPScase keyed property', () => {
            setup('caps');
            button.dispatchEvent(new CustomEvent('CAPSCASE'));
            expect(testFn).toHaveBeenCalledWith('CAPSCASE handler called');
        });

        it('adds event listeners corresponding to PascalCase keyed property', () => {
            setup('pascal');
            button.dispatchEvent(new CustomEvent('PascalCase'));
            expect(testFn).toHaveBeenCalledWith('PascalCase handler called');
        });

        it('adds event listeners corresponding to empty-string keyed property', () => {
            setup('empty');
            button.dispatchEvent(new CustomEvent(''));
            expect(testFn).toHaveBeenCalledWith('empty string handler called');
        });
    });

    it('event listeners are added independently from lwc:on and lwc:spread', () => {
        const element = createElement('x-spread', { is: Spread });
        const testFn = jasmine.createSpy('test function');
        element.testFn = testFn;
        document.body.appendChild(element);
        const button = element.shadowRoot.querySelector('button');

        button.click();

        expect(testFn).toHaveBeenCalledWith('lwc:spread handler called');
        expect(testFn).toHaveBeenCalledWith('lwc:on handler called');
    });

    it("event listeners are added before child's connectedCallback", () => {
        const element = createElement('x-lifecycle', { is: Lifecycle });
        const testFn = jasmine.createSpy('foo handler');
        element.testFn = testFn;
        document.body.appendChild(element);

        expect(testFn).toHaveBeenCalledWith(
            'handled events dispatched from child connectedCallback'
        );
    });

    describe('re-render behavior', () => {
        let element;
        let button;
        let testFn;

        describe('without for:each loop', () => {
            beforeEach(() => {
                element = createElement('x-rerender', { is: Rerender });
                testFn = jasmine.createSpy('test function');
                element.testFn = testFn;
                document.body.appendChild(element);
                button = element.shadowRoot.querySelector('button');
            });

            describe('with new object', () => {
                it('Event listeners are added when lwc:on is provided a new object with additional properties', async () => {
                    element.listenersName = 'click and mouseover';
                    await element.triggerReRender();

                    button.click();
                    button.dispatchEvent(new MouseEvent('mouseover'));
                    expect(testFn).toHaveBeenCalledWith('click handler called');
                    expect(testFn).toHaveBeenCalledWith('mouseover handler called');
                });

                it('Event listeners are removed when lwc:on is provided a new object with reduced properties', async () => {
                    element.listenersName = 'empty';
                    await element.triggerReRender();

                    button.click();
                    expect(testFn).not.toHaveBeenCalledWith('click handler called');
                });

                it('Event listeners are modified when lwc:on is provided a new object with modified properties', async () => {
                    element.listenersName = 'modified click';
                    await element.triggerReRender();

                    button.click();
                    expect(testFn).not.toHaveBeenCalledWith('click handler called');
                    expect(testFn).toHaveBeenCalledWith('modified click handler called');
                });
            });

            describe('with same object modified', () => {
                let caughtError;

                catchUnhandledRejectionsAndErrors((error) => {
                    caughtError = error;
                });

                afterEach(() => {
                    caughtError = undefined;
                });

                it('throws when a new property is added to object passed to lwc:on', async () => {
                    element.addMouseoverHandler();
                    await element.triggerReRender();
                    await new Promise((resolve) => setTimeout(resolve));
                    await new Promise((resolve) => setTimeout(resolve));
                    expect(caughtError.message).toBe(
                        "Detected mutation of property 'mouseover' in the object passed to lwc:on for <button>. Reusing the same object with modified properties is prohibited. Please pass a new object instead."
                    );
                });

                it('throws when a property is modified in object passed to lwc:on', async () => {
                    element.modifyClickHandler();
                    await element.triggerReRender();
                    await new Promise((resolve) => setTimeout(resolve));
                    await new Promise((resolve) => setTimeout(resolve));
                    expect(caughtError.message).toBe(
                        "Detected mutation of property 'click' in the object passed to lwc:on for <button>. Reusing the same object with modified properties is prohibited. Please pass a new object instead."
                    );
                });

                it('throws when a property is deleted from object passed to lwc:on', async () => {
                    element.deleteClickHandler();
                    await element.triggerReRender();
                    await new Promise((resolve) => setTimeout(resolve));
                    await new Promise((resolve) => setTimeout(resolve));
                    expect(caughtError.message).toBe(
                        "Detected mutation of property 'click' in the object passed to lwc:on for <button>. Reusing the same object with modified properties is prohibited. Please pass a new object instead."
                    );
                });
            });
        });

        describe('with for:each loop and local variable passed as argument to lwc:on', () => {
            beforeEach(() => {
                element = createElement('x-rerender-loop', { is: RerenderLoop });
                testFn = jasmine.createSpy('test function');
                element.testFn = testFn;
                document.body.appendChild(element);
                button = element.shadowRoot.querySelector('button');
            });

            describe('with new object', () => {
                it('Event listeners are added when lwc:on is provided a new object with additional properties', async () => {
                    element.listenersName = 'click and mouseover';
                    await element.triggerReRender();

                    button.click();
                    button.dispatchEvent(new MouseEvent('mouseover'));
                    expect(testFn).toHaveBeenCalledWith('click handler called');
                    expect(testFn).toHaveBeenCalledWith('mouseover handler called');
                });

                it('Event listeners are removed when lwc:on is provided a new object with reduced properties', async () => {
                    element.listenersName = 'empty';
                    await element.triggerReRender();

                    button.click();
                    expect(testFn).not.toHaveBeenCalledWith('click handler called');
                });

                it('Event listeners are modified when lwc:on is provided a new object with modified properties', async () => {
                    element.listenersName = 'modified click';
                    await element.triggerReRender();

                    button.click();
                    expect(testFn).not.toHaveBeenCalledWith('click handler called');
                    expect(testFn).toHaveBeenCalledWith('modified click handler called');
                });
            });

            describe('with same object modified', () => {
                let caughtError;

                catchUnhandledRejectionsAndErrors((error) => {
                    caughtError = error;
                });

                afterEach(() => {
                    caughtError = undefined;
                });

                it('throws when a new property is added to object passed to lwc:on', async () => {
                    element.addMouseoverHandler();
                    await element.triggerReRender();
                    await new Promise((resolve) => setTimeout(resolve));
                    await new Promise((resolve) => setTimeout(resolve));
                    expect(caughtError.message).toBe(
                        "Detected mutation of property 'mouseover' in the object passed to lwc:on for <button>. Reusing the same object with modified properties is prohibited. Please pass a new object instead."
                    );
                });

                it('throws when a property is modified in object passed to lwc:on', async () => {
                    element.modifyClickHandler();
                    await element.triggerReRender();
                    await new Promise((resolve) => setTimeout(resolve));
                    await new Promise((resolve) => setTimeout(resolve));
                    expect(caughtError.message).toBe(
                        "Detected mutation of property 'click' in the object passed to lwc:on for <button>. Reusing the same object with modified properties is prohibited. Please pass a new object instead."
                    );
                });

                it('throws when a property is deleted from object passed to lwc:on', async () => {
                    element.deleteClickHandler();
                    await element.triggerReRender();
                    await new Promise((resolve) => setTimeout(resolve));
                    await new Promise((resolve) => setTimeout(resolve));
                    expect(caughtError.message).toBe(
                        "Detected mutation of property 'click' in the object passed to lwc:on for <button>. Reusing the same object with modified properties is prohibited. Please pass a new object instead."
                    );
                });
            });
        });
    });

    it('works when the object is passed as public property to component', () => {
        // In this test, we are implicitly asserting that no error is thrown if the test passes
        const element = createElement('x-public-prop', { is: PublicProp });
        const testFn = jasmine.createSpy('test function');
        element.eventHandlers = {
            click: testFn,
        };
        document.body.appendChild(element);
        const button = element.shadowRoot.querySelector('button');

        button.click();
        expect(testFn).toHaveBeenCalled();
    });
});
