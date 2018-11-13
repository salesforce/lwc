import { compileTemplate } from 'test-utils';
import { createElement, LightningElement } from '../../../framework/main';
import applyEventPolyfill from '../../patch-event/polyfill';
import applyComposedPolyfill from '../polyfill';

// TODO: https://github.com/salesforce/lwc/pull/568#discussion_r208827386
// While Jest creates a new window object between each test file evaluation, the
// jsdom code is not reevaluated. Which mean that the patched
// HTMLElement.prototype.click will remain patched for all the tests that happen
// to run in the same worker. This is a growing pain that we have today because
// it introduces an uncertainty in the way tests run. We really need to speak
// about to mitigate this issue in the future.
applyEventPolyfill();
applyComposedPolyfill();

describe('click-event-composed polyfill', () => {
    const html = compileTemplate(`
        <template>
            <button onclick={handleClick}>click me</button>
        </template>
    `);

    it('should patch click events for listeners bound to the host element', () => {
        expect.assertions(1);
        // TODO: this test is confusing, I think it was working due to a bug
        // in our old patching of the click event.

        class Foo extends LightningElement {
            renderedCallback() {
                this.template.addEventListener('click', event => {
                    const isCustomClick = event instanceof CustomEvent;
                    if (!isCustomClick) {
                        return;
                    }
                    expect(event.composed).toBe(false);
                });
                this.template.querySelector('button').click();
            }
            render() {
                return html;
            }
            handleClick(event: Event) {
                const isCustomClick = event instanceof CustomEvent;
                if (isCustomClick) {
                    return;
                }
                // Stop native click since we expect it to be composed in most
                // browsers and substitute a non-composed version in its place.
                event.stopPropagation();
                const nonComposedClickEvent = new CustomEvent('click', { bubbles: true });
                const button = event.target;
                button.dispatchEvent(nonComposedClickEvent);
            }
        }

        document.body.appendChild(createElement('x-foo', { is: Foo }));
    });

    it('should not patch click events for listeners bound to the target element (known limitation)', () => {
        expect.assertions(1);

        class Foo extends LightningElement {
            renderedCallback() {
                const button = this.template.querySelector('button');
                button.addEventListener('click', event => {
                    const isCustomClick = event instanceof CustomEvent;
                    if (!isCustomClick) {
                        return;
                    }
                    expect(event.composed).toBe(false);
                });
                button.click();
            }
            render() {
                return html;
            }
            handleClick(event: Event) {
                const isCustomClick = event instanceof CustomEvent;
                if (!isCustomClick) {
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
