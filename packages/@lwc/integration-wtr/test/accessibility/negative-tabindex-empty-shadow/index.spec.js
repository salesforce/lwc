import { createElement } from 'lwc';
import Container from 'x/container';
import { resetDOM } from '../../../helpers/reset.js';

describe.runIf(!process.env.NATIVE_SHADOW)(
    'focus navigation through a negative-tabindex host without tabbable descendants',
    () => {
        afterEach(resetDOM);

        function createFixture() {
            const container = createElement('x-container', { is: Container });
            document.body.appendChild(container);
            const root = container.shadowRoot;
            return {
                root,
                before: root.querySelector('input'),
                menu: root.querySelector('x-menu'),
                after: root.querySelector('button'),
                footer: root.querySelector('a:last-child'),
            };
        }

        // Assistive technology can enter a tabindex=-1 host without a preceding
        // mousedown or Tab key. Use an unpatched focus method from a separate realm
        // so the browser emits the same focus transition without requiring VoiceOver.
        function enterMenu(menu, relatedTarget) {
            relatedTarget.focus();
            const iframe = document.createElement('iframe');
            document.body.appendChild(iframe);
            const nativeFocus = iframe.contentWindow.HTMLElement.prototype.focus;
            iframe.remove();
            nativeFocus.call(menu);
        }

        it('continues after the host instead of restarting at the document beginning', () => {
            const { root, before, menu, after } = createFixture();
            enterMenu(menu, before);
            expect(root.activeElement).toBe(after);
        });

        it('continues before the host when entering from below', () => {
            const { root, before, menu, after } = createFixture();
            enterMenu(menu, after);
            expect(root.activeElement).toBe(before);
        });

        it('does not wrap to earlier elements when there is no following candidate', () => {
            const { before, menu, after, footer } = createFixture();
            after.remove();
            footer.remove();
            enterMenu(menu, before);
            expect(document.activeElement).toBe(document.body);
        });

        it('keeps the existing navigation behavior when the menu has a tabbable descendant', () => {
            const { root, before, menu, after } = createFixture();
            menu.shadowRoot.querySelector('button').tabIndex = 0;
            enterMenu(menu, before);
            expect(root.activeElement).toBe(after);
        });

        it('ignores focus transitions originating inside the host', () => {
            const { menu } = createFixture();
            const option = menu.shadowRoot.querySelector('button');
            option.tabIndex = 0;
            option.focus();
            menu.dispatchEvent(
                new FocusEvent('focusin', {
                    bubbles: true,
                    composed: true,
                    relatedTarget: option,
                })
            );
            expect(menu.shadowRoot.activeElement).toBe(option);
        });
    }
);
