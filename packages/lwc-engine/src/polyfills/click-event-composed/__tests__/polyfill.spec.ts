import { LightningElement } from '../../../framework/html-element';
import { createElement } from '../../../framework/upgrade';
import { compileTemplate } from 'test-utils';
import applyPolyfill from '../polyfill';

applyPolyfill();

describe.only('click-event-composed polyfill', () => {
    it('should patch click events for listeners bound to the host element', () => {
        expect.assertions(2);

        class Foo extends LightningElement {
            renderedCallback() {
                this.addEventListener('click', event => {
                    if (event instanceof MouseEvent) {
                        return;
                    }
                    expect(event instanceof CustomEvent).toBe(true);
                    expect(event.composed).toBe(true);
                });
                this.template.querySelector('button').click();
            }
            render() {
                return compileTemplate(`
                    <template>
                        <button onclick={handleClick}>click me</button>
                    </template>
                `);
            }
            handleClick(event: MouseEvent) {
                if (event instanceof MouseEvent) {
                    // Stop native click since we expect it to be composed in most
                    // browsers and substitute a non-composed version in its place.
                    event.stopPropagation();
                    const nonComposedClickEvent = new CustomEvent('click', { bubbles: true });
                    const button = event.target;
                    button.dispatchEvent(nonComposedClickEvent);
                }
            }
        }

        document.body.appendChild(createElement('x-foo', { is: Foo }));
    });

    it('should not patch click events for listeners bound to the target element (known limitation)', () => {
        expect.assertions(2);

        class Foo extends LightningElement {
            renderedCallback() {
                const button = this.template.querySelector('button');
                button.addEventListener('click', event => {
                    if (event instanceof MouseEvent) {
                        return;
                    }
                    expect(event instanceof CustomEvent).toBe(true);
                    expect(event.composed).toBe(false);
                });
                button.click();
            }
            render() {
                return compileTemplate(`
                    <template>
                        <button onclick={handleClick}>click me</button>
                    </template>
                `);
            }
            handleClick(event: MouseEvent) {
                if (event instanceof MouseEvent) {
                    // Stop native click since we expect it to be composed in most
                    // browsers and substitute a non-composed version in its place.
                    event.stopPropagation();
                    const nonComposedClickEvent = new CustomEvent('click', { bubbles: true });
                    const button = event.target;
                    button.dispatchEvent(nonComposedClickEvent);
                }
            }
        }

        document.body.appendChild(createElement('x-foo', { is: Foo }));
    });
});
