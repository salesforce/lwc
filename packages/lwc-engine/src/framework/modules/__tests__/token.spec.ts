import { compileTemplate } from 'test-utils';
import { createElement, LightningElement } from '../../main';
import { getHostShadowRoot } from "../../html-element";

describe('vnode token', () => {
    it('adds token to all the children elements', () => {
        const tmpl = compileTemplate(`
            <template>
                <section>test</section>
            </template>
        `);
        tmpl.shadowToken = 'test';

        class Component extends LightningElement {
            render() {
                return tmpl;
            }
        }

        const cmp = createElement('x-cmp', { is: Component });
        document.body.appendChild(cmp);

        expect(getHostShadowRoot(cmp).querySelectorAll('[test]')).toHaveLength(1);
    });

    it('removes children element tokens if the template has no token', () => {
        const styledTmpl = compileTemplate(`
            <template>
                <section>styled</section>
            </template>
        `);
        styledTmpl.shadowToken = 'test';

        const unstyledTmpl = compileTemplate(`
            <template>
                <section>unstyled</section>
            </template>
        `);

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
        expect(getHostShadowRoot(cmp).querySelectorAll('[test]')).toHaveLength(1);

        cmp.tmpl = unstyledTmpl;

        return Promise.resolve().then(() => {
            expect(getHostShadowRoot(cmp).querySelectorAll('section')).toHaveLength(1);
            expect(getHostShadowRoot(cmp).querySelectorAll('[test]')).toHaveLength(0);
        });
    });

    it('replace children element tokens when swapping template', () => {
        const styledTmplA = compileTemplate(`
            <template>
                <section>styledA</section>
            </template>
        `);
        styledTmplA.shadowToken = 'testA';

        const styledTmplB = compileTemplate(`
            <template>
                <section>styledB</section>
            </template>
        `);
        styledTmplB.shadowToken = 'testB';

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

        expect(getHostShadowRoot(cmp).querySelectorAll('[testA]')).toHaveLength(1);
        expect(getHostShadowRoot(cmp).querySelectorAll('[testB]')).toHaveLength(0);

        cmp.tmpl = styledTmplB;

        return Promise.resolve().then(() => {
            expect(getHostShadowRoot(cmp).querySelectorAll('[testA]')).toHaveLength(0);
            expect(getHostShadowRoot(cmp).querySelectorAll('[testB]')).toHaveLength(1);
        });
    });
});
