import target from '../computed-style-attr';
import { createElement, LightningElement } from '../../main';
import * as api from '../../api';

describe('modules/computed-style-attr', () => {
    it('should add style to the element', () => {
        const tmpl = $api => [
            $api.h('div', { key: 0, style: 'display: inline' }, [ $api.t('test') ]),
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
    it('should patch style to the element', () => {
        const tmpl = ($api, $cmp) => [
            $api.h('div', { key: 0, style: $cmp.counter % 2 ? 'display: block' : 'display: inline' }, [ $api.t('test') ]),
        ];
        let cmp;
        class MyComponent extends LightningElement {
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

    it('assign correct style value when style is present', () => {
        const style = 'color:red';
        class Foo extends LightningElement {}
        const vnode = api.c('x-foo', Foo, { style });
        const elm = document.createElement('p');
        vnode.elm = elm;
        target.create(vnode);
        expect(elm.style.color).toBe('red');
    });

    it('should not coerce style to string when is object', () => {
        const style = {
            color: 'red',
            toString() {
                return 'color: red';
            }
        };
        function html($api) {
            return [$api.h('p', { key: 0, style }, [])];
        }
        let template;
        class Foo extends LightningElement {
            render() {
                template = this.template;
                return html;
            }
        }
        expect(() => {
            const elm = createElement('x-cmp', { is: Foo });
            document.body.appendChild(elm);
        }).toLogWarning(`Invalid 'style' attribute passed to <p> should be a string value, and will be ignored.`);
        expect(template.querySelector('p').hasAttribute('style')).toBe(false);
    });

    it('should patch style to the element', () => {
        const tmpl = ($api, $cmp) => [
            $api.h('div', { key: 0, style: $cmp.counter % 2 ? `position: relative` : `display: inline` }, [ $api.t('test') ]),
        ];
        let cmp;
        class MyComponent extends LightningElement {
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
