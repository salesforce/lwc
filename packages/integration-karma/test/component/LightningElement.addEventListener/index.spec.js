import { LightningElement } from 'lwc';
import { createElement } from 'test-utils';

it('should be able to attach an event listener on the host element', () => {
    let isInvoked = false;

    class Test extends LightningElement {
        connectedCallback() {
            this.addEventListener('click', () => {
                isInvoked = true;
            });
        }
    }
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);

    elm.click();

    expect(isInvoked).toBe(true);
});

it('should invoke the event listener with undefined as this value', () => {
    let handleThis = false;

    class Test extends LightningElement {
        connectedCallback() {
            this.addEventListener('click', function() {
                handleThis = this;
            });
        }
    }
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);

    elm.click();

    expect(handleThis).toBe(undefined);
});

it('should invoke the event listener with the event as argument', () => {
    let handlerArgs = false;

    class Test extends LightningElement {
        connectedCallback() {
            this.addEventListener('click', function(...args) {
                handlerArgs = args;
            });
        }
    }
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);

    elm.click();

    expect(handlerArgs.length).toBe(1);
    expect(handlerArgs[0] instanceof Event).toBe(true);
    expect(handlerArgs[0].type).toBe('click');
});

it('should warn when adding multiple times the same event handler', () => {
    class Test extends LightningElement {
        connectedCallback() {
            const handler = () => {};

            this.addEventListener('click', handler);
            this.addEventListener('click', handler);
        }
    }
    const elm = createElement('x-test', { is: Test });

    spyOn(console, 'warn');
    document.body.appendChild(elm);

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn.calls.argsFor(0)[0]).toMatch(
            /\[LWC warning\]: \[object HTMLElement\] has duplicate listener for event "click"\. Instead add the event listener in the connectedCallback\(\) hook\./
    );
});

it('should warn when passing a 3rd parameter to the event handler', () => {
    class Test extends LightningElement {
        connectedCallback() {
            this.addEventListener('click', () => {}, {
                once: true,
            });
        }
    }
    const elm = createElement('x-test', { is: Test });

    spyOn(console, 'warn');
    document.body.appendChild(elm);

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn.calls.argsFor(0)[0]).toMatch(
            /\[LWC warning\]: The 'addEventListener' method in 'LightningElement' does not support more than 2 arguments\. Options to make the listener passive, once, or capture are not allowed/
    );
});

it('should throw an error if event handler is not a function', () => {
    class Test extends LightningElement {
        connectedCallback() {
            this.addEventListener('click');
        }
    }
    const elm = createElement('x-test', { is: Test });

    expect(() => {
        document.body.appendChild(elm);
    }).toThrowError(
        Error,
        /Invariant Violation: Invalid second argument for this\.addEventListener\(\) in \[.*\] for event "click"\. Expected an EventListener but received undefined\./
    )
});
