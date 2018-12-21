import { createElement, LightningElement, api } from 'lwc';
import { html } from 'test-utils';

it('directive for:each', () => {
    const template = html`
        <template>
            <ul>
                <template for:each={items} for:item="item">
                    <li key={item.key}>{item.value}</li>
                </template>
            </ul>
        </template>
    `;

    class XTest extends LightningElement {
        @api items = [];

        render() {
            return template();
        }
    }

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
