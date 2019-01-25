import { LightningElement } from 'lwc';
import { createElement } from 'test-utils';

function testConnectSlot(name, fn) {
    it(`should invoke the connectedCallback the root element is added in the DOM via ${name}`, () => {
        let isConnected = false;
        class ConnectedComponent extends LightningElement {
            connectedCallback() {
                isConnected = true;
            }
        }

        const el = createElement('x-connected-component', { is: ConnectedComponent });
        fn(el);
        expect(isConnected).toBe(true);
    });
}

testConnectSlot('Node.appendChild', (elm) => {
    document.body.appendChild(elm);
});

testConnectSlot('Node.insertBefore', (elm) => {
    const child = document.createElement('div');
    document.body.appendChild(child);
    document.body.insertBefore(elm, child);
});

testConnectSlot('Node.replaceChild', (elm) => {
    const child = document.createElement('div');
    document.body.appendChild(child);
    document.body.replaceChild(elm, child);
});
