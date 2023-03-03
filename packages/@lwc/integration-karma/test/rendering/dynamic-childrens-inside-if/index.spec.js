import { createElement } from 'lwc';
import ForEachCmp from 'x/forEachCmp';
import LwcDynamic from 'x/lwcDynamic';
import Dynamic from 'x/dynamic';

describe('for:each', () => {
    it('should remove/add elements when if is toggled', function () {
        const elm = createElement('x-container', { is: ForEachCmp });
        document.body.appendChild(elm);
        const divWithChildrenWrappedByIf = elm.shadowRoot.querySelector('div');

        elm.shadowRoot.querySelector('button').click();

        return Promise.resolve()
            .then(() => {
                expect(divWithChildrenWrappedByIf.textContent).toBe('item 1item 2');
                elm.shadowRoot.querySelector('button').click();
            })
            .then(() => {
                expect(divWithChildrenWrappedByIf.textContent).toBe('');
                elm.shadowRoot.querySelector('button').click();
            })
            .then(() => {
                expect(divWithChildrenWrappedByIf.textContent).toBe('item 1item 2');
            });
    });
});

describe('lwc:dynamic', () => {
    it('should remove/add elements when if is toggled', function () {
        const elm = createElement('x-container', { is: LwcDynamic });
        document.body.appendChild(elm);

        const divWithChildrenWrappedByIf = elm.shadowRoot.querySelector('div');
        elm.shadowRoot.querySelector('button').click();

        return Promise.resolve()
            .then(() => {
                expect(divWithChildrenWrappedByIf.textContent).toBe('item');
                elm.shadowRoot.querySelector('button').click();
            })
            .then(() => {
                expect(divWithChildrenWrappedByIf.textContent).toBe('');
                elm.shadowRoot.querySelector('button').click();
            })
            .then(() => {
                expect(divWithChildrenWrappedByIf.textContent).toBe('item');
            });
    });
});

describe('dynamic components', () => {
    it('should remove/add elements when if is toggled', function () {
        const elm = createElement('x-container', { is: Dynamic });
        document.body.appendChild(elm);

        const divWithChildrenWrappedByIf = elm.shadowRoot.querySelector('div');
        elm.shadowRoot.querySelector('button').click();

        return Promise.resolve()
            .then(() => {
                expect(divWithChildrenWrappedByIf.textContent).toBe('item');
                elm.shadowRoot.querySelector('button').click();
            })
            .then(() => {
                expect(divWithChildrenWrappedByIf.textContent).toBe('');
                elm.shadowRoot.querySelector('button').click();
            })
            .then(() => {
                expect(divWithChildrenWrappedByIf.textContent).toBe('item');
            });
    });
});
