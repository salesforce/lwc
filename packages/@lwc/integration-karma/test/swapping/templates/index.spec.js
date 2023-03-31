import { createElement, swapTemplate } from 'lwc';

import Simple from 'base/simple';
import Advanced from 'base/advanced';
import { first, second } from 'base/views';

const simpleBaseTemplate = Simple.baseTemplate;
const advancedBaseTemplate = Advanced.baseTemplate;

// Swapping is only enabled in dev mode
if (process.env.NODE_ENV !== 'production') {
    describe('template swapping', () => {
        it('should work with components with implicit template definition', () => {
            const elm = createElement('x-simple', { is: Simple });
            document.body.appendChild(elm);
            expect(elm.shadowRoot.firstChild.outerHTML).toBe('<p class="simple">simple</p>');
            swapTemplate(simpleBaseTemplate, first);
            return Promise.resolve()
                .then(() => {
                    expect(elm.shadowRoot.firstChild.outerHTML).toBe('<p class="first">first</p>');
                    swapTemplate(first, second);
                })
                .then(() => {
                    expect(elm.shadowRoot.firstChild.outerHTML).toBe(
                        '<p class="second">second</p>'
                    );
                });
        });

        it('should work with components with explict template definition', () => {
            const elm = createElement('x-advanced', { is: Advanced });
            document.body.appendChild(elm);
            expect(elm.shadowRoot.firstChild.outerHTML).toBe('<p class="advanced">advanced</p>');
            swapTemplate(advancedBaseTemplate, second);
            return Promise.resolve().then(() => {
                expect(elm.shadowRoot.firstChild.outerHTML).toBe('<p class="second">second</p>');
            });
        });

        it('should throw for invalid old template', () => {
            expect(() => {
                swapTemplate(function () {}, second);
            }).toThrow();
        });

        it('should throw for invalid new template', () => {
            expect(() => {
                swapTemplate(second, function () {});
            }).toThrow();
        });
    });
}
