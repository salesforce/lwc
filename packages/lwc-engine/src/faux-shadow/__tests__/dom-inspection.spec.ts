import { compileTemplate } from 'test-utils';
import { createElement, LightningElement } from '../../framework/main';
import { getHostShadowRoot } from "../../framework/html-element";

describe('DOM inspection', () => {
    const parentTmpl = compileTemplate(`
        <template>
            <div class="portal">
                Before[
                <slot></slot>
                ]After
            </div>
        </template>
    `);

    class Parent extends LightningElement {
        render() {
            return parentTmpl;
        }
    }

    const containerTemplate = compileTemplate(`
        <template>
            <x-parent>
                <div class="first">
                    Passed Text
                </div>
            </x-parent>
        </template>
    `, {
        modules: { 'x-parent': Parent }
    });

    class Container extends LightningElement {
        render() {
            return containerTemplate;
        }
    }

    const element = createElement('x-container', { is: Container });
    document.body.appendChild(element);

    describe('#innerHTML', () => {
        it('should implement elm.innerHTML shadow dom semantics', () => {
            const p = getHostShadowRoot(element).querySelector('x-parent');
            expect(p.innerHTML).toBe('<div class=\"first\">Passed Text</div>');
            expect(getHostShadowRoot(p).querySelector('div').innerHTML).toBe('Before[<slot></slot>]After');
        });
    });

    describe('#outerHTML', () => {
        it('should implement elm.outerHTML shadow dom semantics', () => {
            const p = getHostShadowRoot(element).querySelector('x-parent');
            expect(p.outerHTML).toBe('<x-parent><div class=\"first\">Passed Text</div></x-parent>');
            expect(getHostShadowRoot(p).querySelector('div').outerHTML).toBe('<div class=\"portal\">Before[<slot></slot>]After</div>');
        });
    });

    describe('#textContent', () => {
        it('should implement elm.textContent shadow dom semantics', () => {
            const p = getHostShadowRoot(element).querySelector('x-parent');
            expect(p.textContent).toBe('Passed Text');
            expect(getHostShadowRoot(p).querySelector('div').textContent).toBe('Before[]After');
        });
    });
});
