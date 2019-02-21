import { createElement } from 'test-utils';

import Static from 'x/static';
import Dynamic from 'x/dynamic';

describe('static style attribute', () => {
    it('simple', () => {
        const elm = createElement('x-static', { is: Static });
        document.body.appendChild(elm);

        const target = elm.shadowRoot.querySelector('div');
        expect(target.style.position).toBe('absolute');
        expect(target.style.top).toBe('10px');
    });
});

describe('dyamic style attribute', () => {
    it('simple', () => {
        const elm = createElement('x-dynamic', { is: Dynamic });
        elm.dynamicStyle = 'position: absolute;';
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('div').style.position).toBe('absolute');
    });

    it('replace', () => {
        const elm = createElement('x-dynamic', { is: Dynamic });
        document.body.appendChild(elm);

        elm.dynamicStyle = 'position: relative;';
        return Promise.resolve().then(() => {
            expect(elm.shadowRoot.querySelector('div').style.position).toBe('relative');
        })
    });
});
