import { createElement } from 'lwc';
import ForEachCmp from 'x/forEachCmp';
import LwcDynamic from 'x/lwcDynamic';
import { itWithLightDOM } from 'test-utils';

describe('for:each', () => {
    itWithLightDOM('should remove/add elements when if is toggled', ForEachCmp, (shadow) => () => {
        const elm = createElement('x-container', { is: ForEachCmp });
        document.body.appendChild(elm);
        const template = shadow ? elm.shadowRoot : elm;
        const divWithChildrenWrappedByIf = template.querySelector('div');

        template.querySelector('button').click();

        return Promise.resolve()
            .then(() => {
                expect(divWithChildrenWrappedByIf.textContent).toBe('item 1item 2');
                template.querySelector('button').click();
            })
            .then(() => {
                expect(divWithChildrenWrappedByIf.textContent).toBe('');
                template.querySelector('button').click();
            })
            .then(() => {
                expect(divWithChildrenWrappedByIf.textContent).toBe('item 1item 2');
            });
    });
});

describe('lwc:dynamic', () => {
    itWithLightDOM('should remove/add elements when if is toggled', LwcDynamic, (shadow) => () => {
        const elm = createElement('x-dynamic', { is: LwcDynamic });
        document.body.appendChild(elm);

        const template = shadow ? elm.shadowRoot : elm;

        const divWithChildrenWrappedByIf = template.querySelector('div');
        template.querySelector('button').click();

        return Promise.resolve()
            .then(() => {
                expect(divWithChildrenWrappedByIf.textContent).toBe('item');
                template.querySelector('button').click();
            })
            .then(() => {
                expect(divWithChildrenWrappedByIf.textContent).toBe('');
                template.querySelector('button').click();
            })
            .then(() => {
                expect(divWithChildrenWrappedByIf.textContent).toBe('item');
            });
    });
});
