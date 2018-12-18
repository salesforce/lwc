import { createElement } from 'lwc';
import XTest from 'x/test';

for (let i = 0 ; i < 1000; i++) {
    it('directive for:each', () => {
        const elm = createElement('x-test', { is: XTest });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('ul').childElementCount).toBe(0);
        elm.items = [
            { key: 1, value: 'one' },
            { key: 2, value: 'two' },
            { key: 3, value: 'three' },
        ];

        return Promise.resolve().then(() => {
            const ul = elm.shadowRoot.querySelector('ul');
            expect(ul.childElementCount).toBe(3);
            expect(ul.children[0].textContent).toBe('one');
            expect(ul.children[1].textContent).toBe('two');
            expect(ul.children[2].textContent).toBe('three');

            elm.items = [];
        }).then(() => {
            expect(elm.shadowRoot.querySelector('ul').childElementCount).toBe(0);
        });
    });
}
