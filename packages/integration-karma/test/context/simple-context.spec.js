import { createElement } from 'lwc';
import { installCustomContext, setCustomContext } from 'x/simpleProvider';
import Consumer from 'x/simpleConsumer';

describe('Simple Custom Context Provider', () => {
    it('should be install-able on any dom element', function() {
        const div = document.createElement('div');
        const elm = createElement('x-consumer', { is: Consumer });
        document.body.appendChild(div);
        installCustomContext(div);
        setCustomContext(div, 'ready');
        div.appendChild(elm);
        expect(elm.shadowRoot.textContent).toBe('ready');
    });
    it('should provide "missing" as the default value when no provider is installed', function() {
        const div = document.createElement('div');
        const elm = createElement('x-consumer', { is: Consumer });
        document.body.appendChild(div);
        div.appendChild(elm);
        expect(elm.shadowRoot.textContent).toBe('missing');
    });
    it('should provide "pending" when provide is installed by no value was provided', function() {
        const div = document.createElement('div');
        const elm = createElement('x-consumer', { is: Consumer });
        document.body.appendChild(div);
        installCustomContext(div);
        div.appendChild(elm);
        expect(elm.shadowRoot.textContent).toBe('pending');
    });
    it('should use closest context when installed in a hierarchy of targets', function() {
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
