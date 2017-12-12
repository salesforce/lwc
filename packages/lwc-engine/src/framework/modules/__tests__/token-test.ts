import { Element } from "../../html-element";
import { createElement } from "../../upgrade";

describe('modules/token', () => {
    it('adds token to all the children elements', () => {
        const tmpl = api => [
            api.v('section', {}, [ api.t('test') ]),
        ];
        tmpl.token = 'test';

        class Component extends Element {
            render() {
                return tmpl;
            }
        }

        const cmp = createElement('x-cmp', { is: Component });
        document.body.appendChild(cmp);

        expect(cmp.querySelectorAll('[test]')).toHaveLength(1);
    });

    it('removes children element tokens if the template as no token', () => {
        const styledTmpl = api => [
            api.v('section', {}, [ api.t('test') ]),
        ];
        styledTmpl.token = 'test';

        const unstyledTmpl = api => [
            api.v('section', {}, [ api.t('test') ]),
        ];

        class Component extends Element {
            tmpl = styledTmpl;
            render() {
                return this.tmpl;
            }
        }
        Component.publicProps = {
            tmpl: 0,
        };

        const cmp = createElement('x-cmp', { is: Component });
        document.body.appendChild(cmp);

        expect(cmp.querySelectorAll('section')).toHaveLength(1);
        expect(cmp.querySelectorAll('[test]')).toHaveLength(1);

        cmp.tmpl = unstyledTmpl;

        return Promise.resolve().then(() => {
            expect(cmp.querySelectorAll('section')).toHaveLength(1);
            expect(cmp.querySelectorAll('[test]')).toHaveLength(0);
        });
    });

    it('replace children element tokens when swapping template', () => {
        const styledTmplA = api => [
            api.v('section', {}, [ api.t('test') ]),
        ];
        styledTmplA.token = 'testA';

        const styledTmplB = api => [
            api.v('section', {}, [ api.t('test') ]),
        ];
        styledTmplB.token = 'testB';

        class Component extends Element {
            tmpl = styledTmplA;
            render() {
                return this.tmpl;
            }
        }
        Component.publicProps = {
            tmpl: 0,
        };

        const cmp = createElement('x-cmp', { is: Component });
        document.body.appendChild(cmp);

        expect(cmp.querySelectorAll('[testA]')).toHaveLength(1);
        expect(cmp.querySelectorAll('[testB]')).toHaveLength(0);

        cmp.tmpl = styledTmplB;

        return Promise.resolve().then(() => {
            expect(cmp.querySelectorAll('[testA]')).toHaveLength(0);
            expect(cmp.querySelectorAll('[testB]')).toHaveLength(1);
        });
    });
})
