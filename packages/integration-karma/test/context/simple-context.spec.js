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
});
