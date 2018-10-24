import { compileTemplate } from 'test-utils';

import { createElement, LightningElement } from '../main';

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
    });
});
