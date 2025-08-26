import { createElement } from 'lwc';
import { installCustomContext, setCustomContext } from 'x/simpleProvider';
import Consumer from 'x/simpleConsumer';

describe('Simple Custom Context Provider', () => {
    it('should be install-able on any dom element', function () {
        const div = document.createElement('div');
        const elm = createElement('x-consumer', { is: Consumer });
        document.body.appendChild(div);
        installCustomContext(div);
        setCustomContext(div, 'ready');
        div.appendChild(elm);
        expect(elm.shadowRoot.textContent).toBe('ready');
    });

    it('should call disconnect when no context value is provided', function () {
        const div = document.createElement('div');
        const elm = createElement('x-consumer', { is: Consumer });
        document.body.appendChild(div);

        const spy = {
            connected: jasmine.createSpy('connected'),
            disconnected: jasmine.createSpy('disconnected'),
        };

        installCustomContext(div, spy, true);
        // not providing context intentionally
        div.appendChild(elm);

        expect(spy.connected).toHaveBeenCalledTimes(1);
        div.removeChild(elm);
        expect(spy.disconnected).toHaveBeenCalledTimes(1);
    });

    it('should not call disconnect with same consumer when multiple contexts are set', function () {
        const div = document.createElement('div');
        const elm = createElement('x-consumer', { is: Consumer });
        document.body.appendChild(div);

        const spy = {
            disconnected: jasmine.createSpy('disconnected'),
        };
        installCustomContext(div, spy);
        setCustomContext(div, 'almost ready');
        div.appendChild(elm);
        setCustomContext(div, 'ready');

        expect(() => {
            div.removeChild(elm);
        }).not.toThrowError();
        expect(spy.disconnected).toHaveBeenCalledTimes(1);
    });

    it('should provide "missing" as the default value when no provider is installed', function () {
        const div = document.createElement('div');
        const elm = createElement('x-consumer', { is: Consumer });
        document.body.appendChild(div);
        div.appendChild(elm);
        expect(elm.shadowRoot.textContent).toBe('missing');
    });
    it('should provide "pending" when provide is installed by no value was provided', function () {
        const div = document.createElement('div');
        const elm = createElement('x-consumer', { is: Consumer });
        document.body.appendChild(div);
        installCustomContext(div);
        div.appendChild(elm);
        expect(elm.shadowRoot.textContent).toBe('pending');
    });
    it('should use closest context when installed in a hierarchy of targets', function () {
        const div = document.createElement('div');
        div.innerHTML = '<div class="parent-ctx"><div class="child-ctx"></div></div>';
        const elm = createElement('x-consumer', { is: Consumer });
        const elm2 = createElement('x-consumer', { is: Consumer });
        const childTarget = div.querySelector('.child-ctx');

        document.body.appendChild(div);
        installCustomContext(div);
        installCustomContext(childTarget);
        setCustomContext(div, 'parent');
        setCustomContext(childTarget, 'child');
        div.appendChild(elm);
        childTarget.appendChild(elm2);
        expect(elm.shadowRoot.textContent).toBe('parent');
        expect(elm2.shadowRoot.textContent).toBe('child');
    });
});
