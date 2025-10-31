import { createElement } from 'lwc';
import SyntheticParent from 'c/syntheticParent';

function testSelector(name, selector) {
    it(name, async () => {
        const elm = createElement('c-synthetic-parent', { is: SyntheticParent });
        document.body.appendChild(elm);
        await Promise.resolve();
        let target;
        elm.addEventListener('click', (event) => {
            target = event.target;
        });
        elm.shadowRoot.querySelector(selector).click();
        expect(target).toBe(elm);
    });
}

describe('should resolve to the outermost host element', () => {
    describe('when event dispatched on an element slotted into a native shadow root', () => {
        testSelector('lwc component native shadow', '.lwc-native-child-slotted-button');
        testSelector('lwc component synthetic shadow', '.lwc-synthetic-child-slotted-button');
        testSelector('native web component', '.native-wc-slotted-button');
    });
    describe('when event dispatched on an element inside a native shadow root', () => {
        testSelector('lwc component native shadow', 'c-native-child');
        testSelector('lwc component native shadow', 'c-synthetic-child');
        testSelector('native web component', 'mixed-shadow-mode-retargeting');
    });
});
