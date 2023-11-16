import { createElement } from 'lwc';
import { spyConsole } from 'test-utils';

import EventHandler from 'x/eventHandler';
import EventHandlerOptions from 'x/eventHandlerOptions';
import AdditionWhileDispatch from 'x/additionWhileDispatch';

it('should be able to attach an event listener on the host element', () => {
    let thisValue;
    let args;

    const clickHandler = function (...handlerArgs) {
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

it('should warn when passing a 3rd parameter to the event handler', () => {
    const elm = createElement('x-event-handler-options', { is: EventHandlerOptions });

    expect(() => {
        document.body.appendChild(elm);
    }).toLogErrorDev(
        /\[LWC error\]: The `addEventListener` method in `LightningElement` does not support any options./
    );
});

describe('event handler is not a function', () => {
    let consoleSpy;
    beforeEach(() => {
        consoleSpy = spyConsole();
    });
    afterEach(() => {
        consoleSpy.reset();
    });

    it('should log an error if event handler is not a function', () => {
        const elm = createElement('x-event-handler', { is: EventHandler });

        expect(() => {
            document.body.appendChild(elm);
        }).toThrowCallbackReactionError(/Expected an EventListener but received undefined/);

        if (process.env.NODE_ENV === 'production') {
            expect(consoleSpy.calls.error.length).toEqual(0);
        } else {
            expect(consoleSpy.calls.error.length).toEqual(1);
            expect(consoleSpy.calls.error[0][0].message).toContain(
                'Invalid second argument for this.addEventListener()'
            );
        }
    });
});

it('should not invoke newly added event listeners in the middle of the dispatch', () => {
    const elm = createElement('x-addition-while-dispatch', { is: AdditionWhileDispatch });

    let evt;
    elm.addEventListener('test', (e) => (evt = e));

    document.body.appendChild(elm);

    expect(evt).not.toBeUndefined();
    expect(evt.detail).toEqual({
        handlers: ['a'],
    });
});
