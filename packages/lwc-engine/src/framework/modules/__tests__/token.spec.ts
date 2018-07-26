import { createElement, LightningElement } from '../../main';
import { getHostShadowRoot } from "../../html-element";

describe('modules/token', () => {
    it('adds token to all the children elements', () => {
        const tmpl = $api => [
            $api.h('section', { key: 0 }, [ $api.t('test') ]),
        ];
        tmpl.style = function() {}
        // TODO: eventually these tokens should be attached to the style function
        tmpl.shadowToken = 'test';
        tmpl.hostToken = 'test-host';

        class Component extends LightningElement {
            render() {
                return tmpl;
            }
        }

        const cmp = createElement('x-cmp', { is: Component });
        document.body.appendChild(cmp);

        expect(getHostShadowRoot(cmp).querySelectorAll('[test]')).toHaveLength(2); // style tag and section
    });

    it('removes children element tokens if the template has no token', () => {
        const styledTmpl = $api => [
            $api.h('section', { key: 0 }, [ $api.t('test') ]),
        ];
        styledTmpl.style = function() {}
        // TODO: eventually these tokens should be attached to the style function
        styledTmpl.shadowToken = 'test';
        styledTmpl.hostToken = 'test-host';

        const unstyledTmpl = $api => [
            $api.h('section', { key: 0 }, [ $api.t('test') ]),
        ];

        class Component extends LightningElement {
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

        expect(getHostShadowRoot(cmp).querySelectorAll('section')).toHaveLength(1);
        expect(getHostShadowRoot(cmp).querySelectorAll('[test]')).toHaveLength(2); // style tag and section

        cmp.tmpl = unstyledTmpl;

        return Promise.resolve().then(() => {
            expect(getHostShadowRoot(cmp).querySelectorAll('section')).toHaveLength(1);
            expect(getHostShadowRoot(cmp).querySelectorAll('[test]')).toHaveLength(0);
        });
    });

    it('replace children element tokens when swapping template', () => {
        const styledTmplA = $api => [
            $api.h('section', { key: 0 }, [ $api.t('test') ]),
        ];
        styledTmplA.style = function() {}
        // TODO: eventually these tokens should be attached to the style function
        styledTmplA.shadowToken = 'testA';
        styledTmplA.hostToken = 'testA-host';

        const styledTmplB = $api => [
            $api.h('section', { key: 0 }, [ $api.t('test') ]),
        ];
        styledTmplB.style = function() {}
        // TODO: eventually these tokens should be attached to the style function
        styledTmplB.shadowToken = 'testB';
        styledTmplB.hostToken = 'testB-host';

        class Component extends LightningElement {
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

        expect(getHostShadowRoot(cmp).querySelectorAll('[testA]')).toHaveLength(2); // style tag and section
        expect(getHostShadowRoot(cmp).querySelectorAll('[testB]')).toHaveLength(0);

        cmp.tmpl = styledTmplB;

        return Promise.resolve().then(() => {
            expect(getHostShadowRoot(cmp).querySelectorAll('[testA]')).toHaveLength(0);
            expect(getHostShadowRoot(cmp).querySelectorAll('[testB]')).toHaveLength(2); // style tag and section
        });
    });
});
