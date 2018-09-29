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
            }).toLogWarning('childNodes on [object HTMLParagraphElement] returns a live NodeList which is not stable. Use querySelectorAll instead.');
        });
    });
});
