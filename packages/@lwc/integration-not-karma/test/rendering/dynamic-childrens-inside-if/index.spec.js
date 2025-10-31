import { createElement } from 'lwc';
import ForEachCmp from 'c/forEachCmp';
import LwcDynamic from 'c/lwcDynamic';
import Dynamic from 'c/dynamic';

describe('for:each', () => {
    it('should remove/add elements when if is toggled', async () => {
        const elm = createElement('c-container', { is: ForEachCmp });
        document.body.appendChild(elm);
        const divWithChildrenWrappedByIf = elm.shadowRoot.querySelector('div');

        elm.shadowRoot.querySelector('button').click();

        await Promise.resolve();
        expect(divWithChildrenWrappedByIf.textContent).toBe('item 1item 2');
        elm.shadowRoot.querySelector('button').click();
        await Promise.resolve();
        expect(divWithChildrenWrappedByIf.textContent).toBe('');
        elm.shadowRoot.querySelector('button').click();
        await Promise.resolve();
        expect(divWithChildrenWrappedByIf.textContent).toBe('item 1item 2');
    });
});

describe('lwc:dynamic', () => {
    it('should remove/add elements when if is toggled', async () => {
        const elm = createElement('c-container', { is: LwcDynamic });
        document.body.appendChild(elm);

        const divWithChildrenWrappedByIf = elm.shadowRoot.querySelector('div');
        elm.shadowRoot.querySelector('button').click();

        await Promise.resolve();
        expect(divWithChildrenWrappedByIf.textContent).toBe('item');
        elm.shadowRoot.querySelector('button').click();
        await Promise.resolve();
        expect(divWithChildrenWrappedByIf.textContent).toBe('');
        elm.shadowRoot.querySelector('button').click();
        await Promise.resolve();
        expect(divWithChildrenWrappedByIf.textContent).toBe('item');
    });
});

describe('dynamic components', () => {
    it('should remove/add elements when if is toggled', async () => {
        const elm = createElement('c-container', { is: Dynamic });
        document.body.appendChild(elm);

        const divWithChildrenWrappedByIf = elm.shadowRoot.querySelector('div');
        elm.shadowRoot.querySelector('button').click();

        await Promise.resolve();
        expect(divWithChildrenWrappedByIf.textContent).toBe('item');
        elm.shadowRoot.querySelector('button').click();
        await Promise.resolve();
        expect(divWithChildrenWrappedByIf.textContent).toBe('');
        elm.shadowRoot.querySelector('button').click();
        await Promise.resolve();
        expect(divWithChildrenWrappedByIf.textContent).toBe('item');
    });
});
