import { createElement, Element } from '../../main';

describe('modules/styles', () => {
    it('should add style to the element', () => {
        const tmpl = $api => [
            $api.h('div', { key: 0, style: 'display: inline' }, [ $api.t('test') ]),
        ];
        let cmp;
        class Component extends Element {
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
    it('should add style map to the element', () => {
        const tmpl = $api => [
            $api.h('div', { key: 0, styleMap: { display: 'inline' } }, [ $api.t('test') ]),
        ];
        let cmp;
        class Component extends Element {
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
    it('should patch style to the element', () => {
        const tmpl = ($api, $cmp) => [
            $api.h('div', { key: 0, style: $cmp.counter % 2 ? 'display: block' : 'display: inline' }, [ $api.t('test') ]),
        ];
        let cmp;
        class MyComponent extends Element {
            constructor() {
                super();
                cmp = this;
                this.counter = 0;
            }
            render() {
                return tmpl;
            }
        }
        MyComponent.publicProps = {
            counter: 1
        };
        const elm = createElement('x-cmp', { is: MyComponent });
        document.body.appendChild(elm);
        expect(cmp.template.querySelector('div').style.display).toBe('inline');
        cmp.counter++;
        return Promise.resolve().then(() => {
            expect(cmp.template.querySelector('div').style.display).toBe('block');
        });
    });
    it('should patch style map to the element', () => {
        const tmpl = ($api, $cmp) => [
            $api.h('div', { key: 0, styleMap: $cmp.counter % 2 ? { position: 'relative' } : { display: 'inline' } }, [ $api.t('test') ]),
        ];
        let cmp;
        class MyComponent extends Element {
            constructor() {
                super();
                cmp = this;
                this.counter = 0;
            }
            render() {
                return tmpl;
            }
        }
        MyComponent.publicProps = {
            counter: 1
        };
        const elm = createElement('x-cmp', { is: MyComponent });
        document.body.appendChild(elm);
        expect(cmp.template.querySelector('div').style.display).toBe('inline');
        cmp.counter++;
        return Promise.resolve().then(() => {
            expect(cmp.template.querySelector('div').style.position).toBe('relative');
            expect(cmp.template.querySelector('div').style.display).toBe('');
        });
    });
});
