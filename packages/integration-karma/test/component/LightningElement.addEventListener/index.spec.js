import { createElement } from 'lwc';

import EventHandler from 'x/eventHandler';
import SameEventHandler from 'x/sameEventHandler';
import EventHandlerOptions from 'x/eventHandlerOptions';

it('should be able to attach an event listener on the host element', () => {
    let thisValue;
    let args;

    const clickHandler = function(...handlerArgs) {
        thisValue = this;
        args = handlerArgs;
    };

    const elm = createElement('x-event-handler', { is: EventHandler });
    elm.clickHandler = clickHandler;
    document.body.appendChild(elm);

    elm.click();

    expect(thisValue).toBe(undefined);
    expect(args.length).toBe(1);
    expect(args[0] instanceof Event).toBe(true);
    expect(args[0].type).toBe('click');
});

// TODO: #1043 inconsistent restriction between native shadow and synthetic shadow
xit('should warn when adding multiple times the same event handler', () => {
    const elm = createElement('x-same-event-handler', { is: SameEventHandler });

    spyOn(console, 'warn');
    document.body.appendChild(elm);

    /* eslint-disable-next-line no-console */
    expect(console.warn).toHaveBeenCalledTimes(1);

    /* eslint-disable-next-line no-console */
    expect(console.warn.calls.argsFor(0)[0]).toMatch(
        /\[LWC warning\]: \[object HTMLElement\] has duplicate listener for event "click"\. Instead add the event listener in the connectedCallback\(\) hook\./
    );
});

// TODO: #1043 inconsistent restriction between native shadow and synthetic shadow
xit('should warn when passing a 3rd parameter to the event handler', () => {
    const elm = createElement('x-event-handler-options', { is: EventHandlerOptions });

    spyOn(console, 'warn');
    document.body.appendChild(elm);

    /* eslint-disable-next-line no-console */
    expect(console.warn).toHaveBeenCalledTimes(1);

    /* eslint-disable-next-line no-console */
    expect(console.warn.calls.argsFor(0)[0]).toMatch(
        /\[LWC warning\]: The 'addEventListener' method in 'LightningElement' does not support more than 2 arguments\. Options to make the listener passive, once, or capture are not allowed/
    );
});

// TODO: #1072 - Inconsistent error type thrown between dev and prod
xit('should throw an error if event handler is not a function', () => {
    const elm = createElement('x-event-handler', { is: EventHandler });

    expect(() => {
        document.body.appendChild(elm);
    }).toThrowError(
        Error,
        /Invariant Violation: Invalid second argument for this\.addEventListener\(\) in \[.*\] for event "click"\. Expected an EventListener but received undefined\./
    );
});
