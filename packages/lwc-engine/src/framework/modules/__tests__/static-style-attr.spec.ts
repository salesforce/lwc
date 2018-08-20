import { createElement, LightningElement } from '../../main';

describe('modules/static-style-attr', () => {
    it('should add style map to the element', () => {
        const tmpl = $api => [
            $api.h('div', { key: 0, styleMap: { display: 'inline' } }, [ $api.t('test') ]),
        ];
        let cmp;
        class Component extends LightningElement {
            constructor() {
                super();
                cmp = this;
            }
            render() {
                return tmpl;
            }
        }

        const elm = createElement('x-cmp', { is: Component });
        document.body.appendChild(elm);

        expect(cmp.template.querySelector('div').style.display).toBe('inline');
    });
});
