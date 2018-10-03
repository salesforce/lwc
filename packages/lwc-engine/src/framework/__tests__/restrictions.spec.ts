import { compileTemplate } from 'test-utils';

import { createElement } from '../main';
import { LightningElement } from '../html-element';

describe('restrictions', () => {
    describe('on elements', () => {
        it('should log console warning when accessing elm.childNodes', () => {
            const html = compileTemplate(`
                <template>
                    <p></p>
                </template>
            `);
            let template;
            class Parent extends LightningElement {
                render() {
                    template = this.template;
                    return html;
                }
            }
            const parentElm = createElement('x-parent', { is: Parent });
            document.body.appendChild(parentElm);
            expect(() => {
                template.querySelector('p').childNodes;
            }).toLogWarning('Discouraged access to property \'childNodes\' on \'Node\': It returns a live NodeList and should not be relied upon. Instead, use \'querySelectorAll\' which returns a static NodeList.');
        });

        it('should not restrict host', () => {
            const html = compileTemplate(`
                <template></template>
            `);
            class Parent extends LightningElement {
                render() {
                    return html;
                }
            }
            const elm = createElement('x-parent', { is: Parent });
            expect(elm.shadowRoot.host).toBe(elm);
        });
    });
});
