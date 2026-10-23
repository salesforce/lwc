import { createElement } from 'lwc';
import Menu from 'x/menu';

describe.runIf(!process.env.NATIVE_SHADOW)(
    'focus navigation through a negative-tabindex host without tabbable descendants',
    () => {
        let fixture;

        afterEach(() => {
            fixture?.remove();
        });

        function createFixture() {
            const container = document.createElement('div');
            fixture = container;
            const header = document.createElement('a');
            header.href = '#';
            header.textContent = 'Learn more';
            const before = document.createElement('input');
            const menu = createElement('x-menu', { is: Menu });
            menu.tabIndex = -1;
            const after = document.createElement('button');
            after.textContent = 'Add condition';
            const footer = document.createElement('a');
            footer.href = '#';
            footer.textContent = 'Footer';
            container.append(header, before, menu, after, footer);
            document.body.appendChild(container);
            return { before, menu, after, footer };
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
            const { before, menu, after } = createFixture();
            enterMenu(menu, before);
            expect(document.activeElement).toBe(after);
        });

        it('continues before the host when entering from below', () => {
            const { before, menu, after } = createFixture();
            enterMenu(menu, after);
            expect(document.activeElement).toBe(before);
        });

        it('does not wrap to earlier elements when there is no following candidate', () => {
            const { before, menu, after, footer } = createFixture();
            after.remove();
            footer.remove();
            enterMenu(menu, before);
            expect(document.activeElement).toBe(document.body);
        });

        it('keeps the existing navigation behavior when the menu has a tabbable descendant', () => {
            const { before, menu, after } = createFixture();
            menu.shadowRoot.querySelector('button').tabIndex = 0;
            enterMenu(menu, before);
            expect(document.activeElement).toBe(after);
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
